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
  progressPending?: boolean;
  fixedHeader?: boolean;
  fixedHeaderScrollHeight?: string;
}

export default function TgTable({
  headers = [],
  rows = [],
  maxWidth = 1000,
  selectableRows = false,
  progressPending = false,
  fixedHeader = true,
  fixedHeaderScrollHeight = '300px'
}: TgTableProps) {
  return (
    <DataTable
      fixedHeader={fixedHeader}
      fixedHeaderScrollHeight={fixedHeaderScrollHeight}
      progressPending={progressPending}
      selectableRows={selectableRows}
      columns={headers.map(header => ({
        ...header,
        selector: (row: any) => row[header.value],
        right: (header.align === 'right').toString(),
        center: (header.align === 'center').toString(),
      }))}
      data={rows}
      theme='light'
      striped={true}
      customStyles={{
        responsiveWrapper: { // remove max height
          style: {
            maxHeight: 'calc(100vh - 300px)'
          },
        },
        headRow: {
          style: {
            border: '1px solid rgba(0,0,0,.12)',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12
          },
        },
        table: {
          style: {
            borderBottom: '1px solid rgba(0,0,0,.12)',
            maxWidth: maxWidth,
          }
        },
        rows: {
          style: {
            borderLeft: '1px solid rgba(0,0,0,.12)',
            borderRight: '1px solid rgba(0,0,0,.12)',
          }
        },
      }}
    />
  );
}