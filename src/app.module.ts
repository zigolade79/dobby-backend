import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from './jwt/jwt.module';
import { CommonModule } from './common/common.module';
import { MailModule } from './mail/mail.module';
import * as Joi from 'joi';
import { User } from './users/entities/user.entity';
import { Verification } from './users/entities/verification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === "production",      
      envFilePath: process.env.NODE_ENV === "dev" ? ".env.dev" : ".env.test",
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev','production','test').required(),
        DB_HOST:Joi.string().required(),
        DB_USER:Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_NAME:Joi.string().required(),
        DB_PW :Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),       
      }),      
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
        entities: [User, Verification],
      }
    ),
    UsersModule,
    AuthModule,
    JwtModule.forRoot({
      privateKey:process.env.PRIVATE_KEY,
    }),
    CommonModule,
    MailModule.forRoot({
      apiKey:process.env.MAILGUN_API_KEY,
      domain:process.env.MAILGUN_DOMAIN,
      fromEmail:process.env.MAILGUN_FROM_EMAIL,
    }), 
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
