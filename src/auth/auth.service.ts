import { Injectable, UnauthorizedException } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { PrismaService } from "../prisma.service";
import * as bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";

type Token = {
    access_token: string;
};

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async register(registerDto: RegisterDto): Promise<Token> {
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = await this.prismaService.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                name: registerDto.name,
            },
        });

        const payload = { sub: user.id, email: user.email };
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }

    async login(loginDto: LoginDto): Promise<Token> {
        const user = await this.prismaService.user.findUnique({
            where: {
                email: loginDto.email,
            },
        });

        try {
            const isCorrectPassword = await bcrypt.compare(loginDto.password, user?.password);

            if (!user || !isCorrectPassword) {
                throw new UnauthorizedException("Invalid credentials");
            }

            const payload = { sub: user.id, email: user.email };
            return {
                access_token: await this.jwtService.signAsync(payload),
            };
        } catch (error) {
            throw new UnauthorizedException("Invalid credentials");
        }
    }
}
