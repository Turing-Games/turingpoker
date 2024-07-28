import React from 'react';
import { Table } from '@radix-ui/themes';

interface TgTableProps {
  headers: {
    value: string,
    label: string
    sortable?: boolean
  }[];
  rows: any[];
}

export default function TgTable({
  headers = [],
  rows = [],
}: TgTableProps) {
  return (
    <div>
      <Table.Root
        variant='surface'
      >
        <Table.Header>
          <Table.Row>
            {
              headers.map((header) => (
                <Table.ColumnHeaderCell key={header.value}>{header.label}</Table.ColumnHeaderCell>
              ))
            }
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            rows.map((row) => (
              <Table.Row key={row.id}>
                {
                  headers.map((header) => (
                    <Table.Cell key={header.value}>{row[header.value]}</Table.Cell>
                  ))
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table.Root>
    </div>
  );
}