import { createConnection } from 'typeorm'
import { CustomNamingStrategy } from './customNamingStrategy'

import User from './entities/User'
import SavedOrder from './entities/SavedOrder'

const db = () =>
  createConnection({
    entities: [
      User,
      SavedOrder
    ],
    logging: false,
    namingStrategy: new CustomNamingStrategy(),
    synchronize: true,
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgres://postgres:secret@localhost:5432/postgres'
  })
  .then(() => console!.log('Connected to Postgres with TypeORM'));

export default db