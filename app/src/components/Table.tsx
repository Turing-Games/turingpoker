import React from 'react';
import DataTable from 'react-data-table-component';

interface TgTableProps {
  headers: {
    value: string,
    name: string
    sortable?: boolean
  }[];
  rows: any[];
}

export default function TgTable({
  headers = [],
  rows = [],
}: TgTableProps) {
  return (
    <DataTable
      columns={headers.map(header => ({
        ...header,
        selector: (row: any) => row[header.value]
      }))}
      data={rows}
    />
  );
}