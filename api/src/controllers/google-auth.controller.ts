import {inject} from '@loopback/core';
import {get, Request, Response, RestBindings} from '@loopback/rest';
import {GoogleAuthService} from '../services/google-auth.service';

const passport = require('passport'); // Ensure this loads after the strategy is registered

export class GoogleAuthController {
  constructor(
    @inject('service.googleAuth.service') // Note: fix the binding key (case-sensitive)
    public googleService: GoogleAuthService, // ensures strategy is configured
  ) {}

  @get('/auth/google', {
    responses: {
      '302': {
        description: 'Redirect to Google OAuth',
      },
    },
  })
  loginToGoogle(
    @inject(RestBindings.Http.REQUEST) req: Request,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ) {
    passport.authenticate('google', {
      scope: ['profile', 'email'],
    })(req, res);
  }

  @get('/auth/google/callback', {
    responses: {
      '200': {
        description: 'Callback from Google',
      },
    },
  })
  async googleCallback(
    @inject(RestBindings.Http.REQUEST) req: Request,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      passport.authenticate(
        'google',
        {session: false},
        (err: any, user: any, info: any) => {
          console.log('Callback triggered:', {err, user, info});

          if (err || !user) {
            res.status(401).json({error: 'Authentication failed'});
            return reject(err || new Error('User not found'));
          }

          // Remove password if present
          const {password, ...userData} = user.user || {};

          // ✅ Auth succeeded
          const userProfile = encodeURIComponent(JSON.stringify(userData));

          res.redirect(
            `${process.env.REACT_APP_SITE_URL}/auth/google?accessToken=${user.accessToken}&userProfile=${userProfile}`,
          );
          return resolve();
        },
      )(req, res);
    });
  }

  @get('/login-failed', {
    responses: {
      '200': {
        description: 'Login failed route',
      },
    },
  })
  loginFailed() {
    return {message: 'Login failed. Please try again.'};
  }
}
