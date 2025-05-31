import { DataSource } from 'typeorm';
import { AssetCategory } from '../../modules/asset-management/entities/asset-category.entity';
import { DebtCategory } from '../../modules/debt-management/entities/debt-category.entity';
import { assetCategories } from './asset-categories.seeder';
import { debtCategories } from './debt-categories.seeder';

export const runSeeders = async (dataSource: DataSource) => {
  try {
    // Seed Asset Categories
    console.log('\nSeeding Asset Categories...');
    const assetCategoryRepository = dataSource.getRepository(AssetCategory);

    for (const categoryData of assetCategories) {
      // Check if category already exists by codeName
      const existingCategory = await assetCategoryRepository.findOne({
        where: { codeName: categoryData.codeName },
      });

      if (!existingCategory) {
        const category = assetCategoryRepository.create(categoryData);
        await assetCategoryRepository.save(category);
        console.log(`✓ Created asset category: ${categoryData.name}`);
      } else {
        console.log(`→ Skipped existing asset category: ${categoryData.name}`);
      }
    }

    // Seed Debt Categories
    console.log('\nSeeding Debt Categories...');
    const debtCategoryRepository = dataSource.getRepository(DebtCategory);

    for (const categoryData of debtCategories) {
      // Check if category already exists by codeName
      const existingCategory = await debtCategoryRepository.findOne({
        where: { codeName: categoryData.codeName },
      });

      if (!existingCategory) {
        const category = debtCategoryRepository.create(categoryData);
        await debtCategoryRepository.save(category);
        console.log(`✓ Created debt category: ${categoryData.name}`);
      } else {
        console.log(`→ Skipped existing debt category: ${categoryData.name}`);
      }
    }

    console.log('\n✓ All seeders completed successfully!');
  } catch (error) {
    console.error('\n✗ Error during seeding:', error);
    throw error;
  }
};
