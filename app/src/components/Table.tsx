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
  selectableRows?: boolean;
  loading?: boolean;
}

export default function TgTable({
  headers = [],
  rows = [],
  maxWidth = 1000,
  selectableRows = false,
  loading = false
}: TgTableProps) {
  return (
    <DataTable
      loading={loading}
      selectableRows={selectableRows}
      columns={headers.map(header => ({
        ...header,
        selector: (row: any) => row[header.value],
        right: header.align === 'right',
        center: header.align === 'center',
      }))}
      data={rows}
      theme='light'
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