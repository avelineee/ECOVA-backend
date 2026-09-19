import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class LoginDto {

   @ApiProperty({
    example: 'nasabah1',
    description: 'Username pengguna',
  })
  
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password pengguna',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}