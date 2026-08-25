import { getMetadataArgsStorage } from 'typeorm';
import { Profile } from './profile.entity';

describe('Profile entity', () => {
  const metadata = getMetadataArgsStorage();

  it('uses the profiles table', () => {
    const table = metadata.tables.find((item) => item.target === Profile);

    expect(table?.name).toBe('profiles');
  });

  it('stores only encrypted profile data', () => {
    const columns = metadata.columns
      .filter((column) => column.target === Profile)
      .map((column) => column.propertyName);

    expect(columns).toEqual(
      expect.arrayContaining([
        'id',
        'userId',
        'encryptedData',
        'onboardingCompletedAt',
        'createdAt',
        'updatedAt',
      ]),
    );

    expect(columns).not.toContain('firstName');
    expect(columns).not.toContain('lastName');
    expect(columns).not.toContain('userName');
    expect(columns).not.toContain('dateOfBirth');
    expect(columns).not.toContain('heightCm');
  });

  it('stores encrypted data as text', () => {
    const encryptedDataColumn = metadata.columns.find(
      (column) =>
        column.target === Profile && column.propertyName === 'encryptedData',
    );

    expect(encryptedDataColumn?.options).toMatchObject({
      name: 'encrypted_data',
      type: 'text',
    });
  });

  it('allows only one profile per user', () => {
    const userIdColumn = metadata.columns.find(
      (column) => column.target === Profile && column.propertyName === 'userId',
    );

    expect(userIdColumn?.options).toMatchObject({
      name: 'user_id',
      type: 'uuid',
      unique: true,
    });
  });

  it('deletes the profile when its user is deleted', () => {
    const userRelation = metadata.relations.find(
      (relation) =>
        relation.target === Profile && relation.propertyName === 'user',
    );

    expect(userRelation?.relationType).toBe('one-to-one');

    expect(userRelation?.options.onDelete).toBe('CASCADE');
  });

  it('joins the user through user_id', () => {
    const joinColumn = metadata.joinColumns.find(
      (column) => column.target === Profile && column.propertyName === 'user',
    );

    expect(joinColumn?.name).toBe('user_id');
  });
});
