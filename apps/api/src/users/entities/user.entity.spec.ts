import { getMetadataArgsStorage } from 'typeorm';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { User } from './user.entity';

describe('Authentication entities', () => {
  it('normalizes the user email', () => {
    const user = new User();

    user.email = '  Sergey@Example.COM  ';
    user.normalizeEmail();

    expect(user.email).toBe('Sergey@Example.COM');
    expect(user.emailNormalized).toBe('sergey@example.com');
  });

  it('does not select password hashes by default', () => {
    const passwordHashColumn = getMetadataArgsStorage().columns.find(
      (column) =>
        column.target === User && column.propertyName === 'passwordHash',
    );

    expect(passwordHashColumn?.options.select).toBe(false);
  });

  it('does not select refresh token hashes by default', () => {
    const tokenHashColumn = getMetadataArgsStorage().columns.find(
      (column) =>
        column.target === RefreshToken && column.propertyName === 'tokenHash',
    );

    expect(tokenHashColumn?.options.select).toBe(false);
  });

  it('defines a unique index for normalized emails', () => {
    const normalizedEmailIndex = getMetadataArgsStorage().indices.find(
      (index) =>
        index.target === User && index.name === 'UQ_users_email_normalized',
    );

    expect(normalizedEmailIndex?.unique).toBe(true);
  });

  it('deletes refresh tokens when their user is deleted', () => {
    const userRelation = getMetadataArgsStorage().relations.find(
      (relation) =>
        relation.target === RefreshToken && relation.propertyName === 'user',
    );

    expect(userRelation?.options.onDelete).toBe('CASCADE');
  });
});
