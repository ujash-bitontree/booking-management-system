import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(_context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      _context.getHandler(),
      _context.getClass()
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = _context.switchToHttp().getRequest<{ user?: { role?: Role } }>();
    console.log('RolesGuard - user:', request.user);
    console.log('RolesGuard - requiredRoles:', requiredRoles);

    if (!request.user?.role) {
      console.log('RolesGuard - No role in request user, denying access');
      return false;
    }

    const hasRole = requiredRoles.includes(request.user.role as Role);
    console.log('RolesGuard - hasRole:', hasRole);
    return hasRole;
  }
}
