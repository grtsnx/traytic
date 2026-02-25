import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<FastifyRequest>();

    // Forward cookie + authorization headers to Better Auth session validator
    const headers = new Headers();
    if (req.headers.cookie) headers.set('cookie', req.headers.cookie);
    if (req.headers.authorization)
      headers.set('authorization', req.headers.authorization as string);

    const session = await this.authService.auth.api.getSession({ headers });
    if (!session) throw new UnauthorizedException('Not authenticated');

    // Attach to request so controllers can access via @CurrentUser()
    (req as FastifyRequest & { user: unknown; sessionData: unknown }).user =
      session.user;
    (
      req as FastifyRequest & { user: unknown; sessionData: unknown }
    ).sessionData = session.session;

    return true;
  }
}
