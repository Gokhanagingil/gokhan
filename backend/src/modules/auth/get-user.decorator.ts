import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from './user.entity';

interface RequestWithUser {
  user: User;
}

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
