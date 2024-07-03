import { Test, TestingModule } from '@nestjs/testing';
import { MODEL_INJECT } from '@core/modules/database';
import { User, UserSchema } from './app.schema';
import { AppService } from './app.service';
import {
  closeInMongodConnection,
  RootMongooseTestModule,
} from '@core/modules/database/test-db';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        RootMongooseTestModule({
          useCreateIndex: true,
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: false,
          keepAlive: true,
          family: 4, // Use IPv4, skip trying IPv6
        }),

        MODEL_INJECT([{ name: User.name, schema: UserSchema }]),
      ],

      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return empty object', async () => {
    const users = await service.findAll({});

    expect(users).toHaveLength(1);
  });

  //close connection
  afterAll(async () => {
    await closeInMongodConnection();
  });
});
