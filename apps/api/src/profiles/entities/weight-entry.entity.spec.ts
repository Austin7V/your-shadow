import { getMetadataArgsStorage } from 'typeorm';
import { WeightEntry } from './weight-entry.entity';

describe('WeightEntry entity', () => {
  const metadata = getMetadataArgsStorage();

  it('uses the weight_entries table', () => {
    const table = metadata.tables.find((item) => item.target === WeightEntry);

    expect(table?.name).toBe('weight_entries');
  });

  it('does not expose weight as a database column', () => {
    const columns = metadata.columns
      .filter((column) => column.target === WeightEntry)
      .map((column) => column.propertyName);

    expect(columns).toEqual(
      expect.arrayContaining([
        'id',
        'userId',
        'encryptedData',
        'measuredAt',
        'createdAt',
        'updatedAt',
      ]),
    );

    expect(columns).not.toContain('weight');
    expect(columns).not.toContain('weightKg');
  });

  it('stores weight data as encrypted text', () => {
    const encryptedDataColumn = metadata.columns.find(
      (column) =>
        column.target === WeightEntry &&
        column.propertyName === 'encryptedData',
    );

    expect(encryptedDataColumn?.options).toMatchObject({
      name: 'encrypted_data',
      type: 'text',
    });
  });

  it('uses the current time for new measurements', () => {
    const measuredAtColumn = metadata.columns.find(
      (column) =>
        column.target === WeightEntry && column.propertyName === 'measuredAt',
    );

    expect(measuredAtColumn?.options).toMatchObject({
      name: 'measured_at',
      type: 'timestamptz',
    });

    expect(measuredAtColumn?.options.default).toBeInstanceOf(Function);
  });

  it('indexes weight history by user and time', () => {
    const index = metadata.indices.find(
      (item) =>
        item.target === WeightEntry &&
        item.name === 'IDX_weight_entries_user_measured_at',
    );

    expect(index?.columns).toEqual(['userId', 'measuredAt']);
  });

  it('deletes weight history when the user is deleted', () => {
    const userRelation = metadata.relations.find(
      (relation) =>
        relation.target === WeightEntry && relation.propertyName === 'user',
    );

    expect(userRelation?.relationType).toBe('many-to-one');

    expect(userRelation?.options.onDelete).toBe('CASCADE');
  });

  it('joins the user through user_id', () => {
    const joinColumn = metadata.joinColumns.find(
      (column) =>
        column.target === WeightEntry && column.propertyName === 'user',
    );

    expect(joinColumn?.name).toBe('user_id');
  });
});
