import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { SignUpDto } from "src/auth/dto/signUp.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async create(dto: SignUpDto): Promise<User> {
    const { email, username, password } = dto;

    return await this.prismaService.user.create({
      data: {
        email,
        username,
        password,
      },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
  }
}
