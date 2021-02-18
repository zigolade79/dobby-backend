import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === "production",      
      envFilePath: process.env.NODE_ENV === "dev" ? ".env.dev" : ".env.test",
        
    }),
    GraphQLModule.forRoot({
      installSubscriptionHandlers:true,
      autoSchemaFile: true,
      context: ({req, connection}) =>{
        const TOKEN_KEY = 'x-jwt';
          return { token: req ? req.headers[TOKEN_KEY] : connection.context[TOKEN_KEY]};
       }
     }),
     TypeOrmModule.forRoot(
      {
        type: "postgres",
        ...(process.env.DATABASE_URL
          ? {
              url: process.env.DATABASE_URL,
              ssl: { rejectUnauthorized: false },
            }
          : {
              database: process.env.DB_NAME,
              host: process.env.DB_HOST,
              username: process.env.DB_USER,
              password: process.env.DB_PW,
              port: +process.env.DB_PORT,
            }),
        //synchronize: process.env.NODE_ENV !=="production",
        synchronize: true,
        logging: process.env.NODE_ENV !== "production",
        entities: [],
      }
    ),
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
