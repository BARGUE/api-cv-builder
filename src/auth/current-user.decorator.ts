import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type JwtUser = { userId: string; email: string };

/** Utilisateur authentifié, renseigné par JwtStrategy.validate(). */
export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): JwtUser => ctx.switchToHttp().getRequest().user,
);
