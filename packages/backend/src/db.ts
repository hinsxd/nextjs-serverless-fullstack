import {
  Connection,
  ConnectionManager,
  ConnectionOptions,
  createConnection,
  getConnectionManager
} from 'typeorm';

// Import Entities to ensure files got compiled
import entities from './entities';

// Ref: https://medium.com/safara-engineering/wiring-up-typeorm-with-serverless-5cc29a18824f
export class Database {
  private connectionManager: ConnectionManager = getConnectionManager();

  public async getConnection(): Promise<Connection> {
    const CONNECTION_NAME = `default`;

    let connection: Connection;

    if (this.connectionManager.has(CONNECTION_NAME)) {
      console.info(`Database.getConnection()-using existing connection ...`);
      connection = await this.connectionManager.get(CONNECTION_NAME);

      if (!connection.isConnected) {
        connection = await connection.connect();
      }
    } else {
      console.info(`Database.getConnection()-creating connection ...`);

      const connectionOptions: ConnectionOptions = {
        name: `default`,
        type: `postgres`,
        port: 5432,
        synchronize: process.env.IS_OFFLINE === 'true',
        dropSchema: false,
        logging: process.env.IS_OFFLINE === 'true',
        host: process.env.DB_HOST,
        username: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        entities
      };

      connection = await createConnection(connectionOptions);
    }

    return connection;
  }
}
