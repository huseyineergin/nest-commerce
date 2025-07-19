import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";

export class SignUpDto {
  @IsEmail({}, { message: "Please provide a valid email address." })
  @IsString({ message: "Email must be a string." })
  @IsNotEmpty({ message: "Email is required." })
  email: string;

  @IsString({ message: "Username must be a string." })
  @IsNotEmpty({ message: "Username is required." })
  @MinLength(3, { message: "Username must be at least 3 characters long." })
  @MaxLength(20, { message: "Username must be at most 20 characters long." })
  username: string;

  @IsString({ message: "Password must be a string." })
  @MinLength(8, { message: "Password must be at least 8 characters long." })
  @IsNotEmpty({ message: "Password is required." })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
    }
  )
  password: string;
}
