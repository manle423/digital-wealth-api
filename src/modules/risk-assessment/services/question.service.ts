import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestionRepository } from '../repositories/question.repository';
import { Question } from '../entities/question.entity';
import { CreateQuestionDto } from '../dto/question/create-question.dto';
import { GetQuestionsDto } from '../dto/question/get-questions.dto';
import { PgPagination } from '@/shared/mysqldb/types/pagination.type';
import { QuestionUpdate } from '../dto/question/update-question.dto';
import { handleDatabaseError } from '@/shared/utils/db-error-handler';
import { QuestionTranslationRepository } from '../repositories/question-translation.repository';
import { In } from 'typeorm';
import { Language } from '@/shared/enums/language.enum';
import { QuestionError } from '../enums/question-error.enum';

@Injectable()
export class QuestionService {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly questionTranslationRepository: QuestionTranslationRepository
  ) { }

  /**
   * Lấy danh sách câu hỏi với phân trang và lọc
   */
  async getQuestions(query?: GetQuestionsDto) {
    let pagination = null;

    if (query?.page && query?.limit) {
      pagination = new PgPagination(query.page, query.limit);
    }

    const [questions, totalCount] = await this.questionRepository.findAllQuestions(query, pagination);

    if (!(questions && questions.length)) {
      return { data: [], pagination };
    }

    // Lấy translations cho tất cả câu hỏi
    const questionIds = questions.map(q => q.id);
    const translations = await this.questionTranslationRepository.find({
      questionId: In(questionIds)
    });

    // Gộp translations vào questions
    const questionsWithTranslations = questions.map(question => {
      const questionTranslations = translations.filter(t => t.questionId === question.id);
      return {
        ...question,
        textVi: questionTranslations.find(t => t.language === Language.VI)?.text,
        textEn: questionTranslations.find(t => t.language === Language.EN)?.text
      };
    });

    if (pagination) {
      pagination.totalItems = totalCount;
    }

    return {
      data: questionsWithTranslations,
      pagination,
    };
  }

  /**
   * Tạo nhiều câu hỏi mới
   */
  async createQuestions(questionsData: CreateQuestionDto[]) {
    try {
      const questions = await Promise.all(
        questionsData.map(async (questionDto) => {
          // Tạo câu hỏi
          const question = await this.questionRepository.save({
            order: questionDto.order,
            isActive: questionDto.isActive ?? true,
            category: questionDto.category,
            text: questionDto.textVi || questionDto.textEn,
            options: questionDto.options.map(opt => ({
              textVi: opt.textVi,
              textEn: opt.textEn,
              value: opt.value
            }))
          });

          // Tạo translations
          await this.questionTranslationRepository.save([
            {
              questionId: question[0].id,
              language: Language.VI,
              text: questionDto.textVi
            },
            {
              questionId: question[0].id,
              language: Language.EN,
              text: questionDto.textEn
            }
          ]);

          return question;
        })
      );

      return questions;
    } catch (error) {
      handleDatabaseError(error, 'QuestionService.createQuestions');
    }
  }

  /**
   * Cập nhật nhiều câu hỏi
   */
  async updateQuestions(updates: QuestionUpdate[]): Promise<Question[]> {
    try {
      // First check if all questions exist
      const ids = updates.map(update => update.id);
      const existingQuestions = await this.questionRepository.find({ id: In(ids) });

      if (existingQuestions.length !== ids.length) {
        throw new NotFoundException(QuestionError.QUESTION_NOT_FOUND);
      }

      // Use transaction to ensure atomicity
      return this.questionRepository.withTnx(async (manager) => {
        const updatedQuestions: Question[] = [];

        for (const update of updates) {
          const question = existingQuestions.find(q => q.id === update.id)!;

          // Update question translations if textVi or textEn is provided
          if (update.data.textVi || update.data.textEn) {
            const translations = await this.questionTranslationRepository.find(
              { questionId: question.id }
            );

            for (const translation of translations) {
              if (translation.language === Language.VI && update.data.textVi) {
                translation.text = update.data.textVi;
              } else if (translation.language === Language.EN && update.data.textEn) {
                translation.text = update.data.textEn;
              }
              await manager.save(translation);
            }
          }

          // Update question options if provided
          if (update.data.options) {
            question.options = update.data.options.map(opt => ({
              textVi: opt.textVi || question.options.find(o => o.value === opt.value)?.textVi,
              textEn: opt.textEn || question.options.find(o => o.value === opt.value)?.textEn,
              value: opt.value
            }));
          }

          // Update other question fields
          const updatedQuestion = {
            ...question,
            order: update.data.order ?? question.order,
            category: update.data.category ?? question.category,
            isActive: update.data.isActive ?? question.isActive
          };

          const saved = await manager.save(Question, updatedQuestion);
          updatedQuestions.push(saved);
        }

        return updatedQuestions;
      });
    } catch (error) {
      handleDatabaseError(error, 'QuestionService.updateQuestions');
    }
  }

  /**
   * Xóa nhiều câu hỏi
   */
  async deleteQuestions(ids: string[]): Promise<boolean> {
    return this.questionRepository.deleteMultipleQuestions(ids);
  }
} 