import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async createUser(email: string, name?: string): Promise<User> {
    const user = this.userRepository.create({ email, name });
    return this.userRepository.save(user);
  }
}
