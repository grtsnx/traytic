import { All, Controller, Get, Req, Res } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';

/**
 * Passes all /api/auth/* requests directly to Better Auth handler.
 * Better Auth handles signup, signin, session, signout etc.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('providers')
  getProviders() {
    return {
      github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    };
  }

  @All('*')
  async handleAuth(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    const response = await this.authService.auth.handler(
      new Request(
        `${process.env.BETTER_AUTH_URL}${req.url}`,
        {
          method: req.method,
          headers: req.headers as Record<string, string>,
          body: req.method !== 'GET' && req.method !== 'HEAD'
            ? JSON.stringify(req.body)
            : undefined,
        },
      ),
    );

    reply.status(response.status);
    response.headers.forEach((value, key) => reply.header(key, value));
    const body = await response.text();
    reply.send(body);
  }
}
