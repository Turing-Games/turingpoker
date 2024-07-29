import React from 'react';
import DataTable from 'react-data-table-component';

interface TgTableProps {
  headers: {
    value: string,
    name: string
    sortable?: boolean
    align?: string
  }[];
  rows: any[];
  maxWidth?: number | string;
}

export default function TgTable({
  headers = [],
  rows = [],
  maxWidth = 1000
}: TgTableProps) {
  return (
    <DataTable
      columns={headers.map(header => ({
        ...header,
        selector: (row: any) => row[header.value],
        right: header.align === 'right',
        center: header.align === 'center',
      }))}
      data={rows}
      customStyles={{
        table: {
          style: {
            maxWidth: maxWidth
          }
        }
      }}
    />
  );
}