import { getMetadataArgsStorage } from 'typeorm';
import { HealthConstraint } from './health-constraint.entity';

describe('HealthConstraint entity', () => {
  const metadata = getMetadataArgsStorage();

  it('uses the health_constraints table', () => {
    const table = metadata.tables.find(
      (item) => item.target === HealthConstraint,
    );

    expect(table?.name).toBe('health_constraints');
  });

  it('does not expose health details as columns', () => {
    const columns = metadata.columns
      .filter((column) => column.target === HealthConstraint)
      .map((column) => column.propertyName);

    expect(columns).toEqual(
      expect.arrayContaining([
        'id',
        'userId',
        'encryptedData',
        'isActive',
        'createdAt',
        'updatedAt',
      ]),
    );

    expect(columns).not.toContain('type');
    expect(columns).not.toContain('title');
    expect(columns).not.toContain('notes');
    expect(columns).not.toContain('severity');
  });

  it('stores protected health data as encrypted text', () => {
    const encryptedDataColumn = metadata.columns.find(
      (column) =>
        column.target === HealthConstraint &&
        column.propertyName === 'encryptedData',
    );

    expect(encryptedDataColumn?.options).toMatchObject({
      name: 'encrypted_data',
      type: 'text',
    });
  });

  it('marks new constraints as active', () => {
    const isActiveColumn = metadata.columns.find(
      (column) =>
        column.target === HealthConstraint &&
        column.propertyName === 'isActive',
    );

    expect(isActiveColumn?.options).toMatchObject({
      name: 'is_active',
      type: 'boolean',
      default: true,
    });
  });

  it('indexes active constraints by owner', () => {
    const index = metadata.indices.find(
      (item) =>
        item.target === HealthConstraint &&
        item.name === 'IDX_health_constraints_user_active',
    );

    expect(index?.columns).toEqual(['userId', 'isActive']);
  });

  it('deletes constraints when their user is deleted', () => {
    const userRelation = metadata.relations.find(
      (relation) =>
        relation.target === HealthConstraint &&
        relation.propertyName === 'user',
    );

    expect(userRelation?.relationType).toBe('many-to-one');

    expect(userRelation?.options.onDelete).toBe('CASCADE');
  });

  it('joins the user through user_id', () => {
    const joinColumn = metadata.joinColumns.find(
      (column) =>
        column.target === HealthConstraint && column.propertyName === 'user',
    );

    expect(joinColumn?.name).toBe('user_id');
  });
});
