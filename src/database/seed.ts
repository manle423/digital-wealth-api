import { config } from 'dotenv';
import { runSeeders } from './seeders/run-seeders';
import AppDataSource from '../config/typeorm.config';

// Load environment variables
config();

const seed = async () => {
  try {
    // Initialize the data source
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    // Run seeders
    await runSeeders(AppDataSource);

    // Close the connection
    await AppDataSource.destroy();
    console.log('Connection has been closed.');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seed();
