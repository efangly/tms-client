import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';
import { formatDate, formatDateTime } from '../lib/date-format';

// Register Thai font
Font.register({
  family: 'Sarabun',
  fonts: [
    {
      src: typeof window !== 'undefined'
        ? `${window.location.origin}/fonts/Sarabun-Regular.ttf`
        : '/fonts/Sarabun-Regular.ttf',
      fontWeight: 'normal',
    },
    {
      src: typeof window !== 'undefined'
        ? `${window.location.origin}/fonts/Sarabun-Bold.ttf`
        : '/fonts/Sarabun-Bold.ttf',
      fontWeight: 'bold',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Sarabun',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dateRange: {
    fontSize: 12,
  },
  table: {
    width: '100%',
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#000',
    minHeight: 25,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    minHeight: 20,
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#fafafa',
  },
  tableColIp: {
    width: '20%',
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  tableColProbe: {
    width: '10%',
    paddingHorizontal: 5,
    paddingVertical: 3,
    textAlign: 'center',
  },
  tableColName: {
    width: '25%',
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  tableColTemp: {
    width: '15%',
    paddingHorizontal: 5,
    paddingVertical: 3,
    textAlign: 'center',
  },
  tableColTime: {
    width: '30%',
    paddingHorizontal: 5,
    paddingVertical: 3,
    textAlign: 'center',
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCellText: {
    fontSize: 9,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#666',
  },
});

export interface TempLogData {
  machineIp: string;
  probeNo: number;
  machineName: string;
  tempValue: number;
  insertTime: string;
  mcuId: string;
}

interface TempLogReportProps {
  data: TempLogData[];
  startDate: string;
  endDate: string;
}

const TempLogReport: React.FC<TempLogReportProps> = ({
  data,
  startDate,
  endDate,
}) => {
  // Split data into pages (approximately 25 rows per page)
  const rowsPerPage = 25;
  const pages: TempLogData[][] = [];
  for (let i = 0; i < data.length; i += rowsPerPage) {
    pages.push(data.slice(i, i + rowsPerPage));
  }

  // If no data, create at least one empty page
  if (pages.length === 0) {
    pages.push([]);
  }

  return (
    <Document>
      {pages.map((pageData, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Image
              src="/logo.png"
              style={styles.logo}
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>รายงานการบันทึกค่าอุณหภูมิ</Text>
              <Text style={styles.dateRange}>
                ตั้งแต่วันที่ {formatDate(startDate)} - {formatDate(endDate)}
              </Text>
            </View>
          </View>

          {/* Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.tableColIp}>
                <Text style={styles.tableHeaderText}>IP</Text>
              </View>
              <View style={styles.tableColProbe}>
                <Text style={styles.tableHeaderText}>Prob No.</Text>
              </View>
              <View style={styles.tableColName}>
                <Text style={styles.tableHeaderText}>ชื่อเครื่อง</Text>
              </View>
              <View style={styles.tableColTemp}>
                <Text style={styles.tableHeaderText}>อุณหภูมิ (°C)</Text>
              </View>
              <View style={styles.tableColTime}>
                <Text style={styles.tableHeaderText}>เวลา</Text>
              </View>
            </View>

            {/* Table Body */}
            {pageData.map((row, index) => (
              <View
                key={index}
                style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]}
              >
                <View style={styles.tableColIp}>
                  <Text style={styles.tableCellText}>{row.machineIp}</Text>
                </View>
                <View style={styles.tableColProbe}>
                  <Text style={styles.tableCellText}>{row.probeNo}</Text>
                </View>
                <View style={styles.tableColName}>
                  <Text style={styles.tableCellText}>{row.mcuId}</Text>
                </View>
                <View style={styles.tableColTemp}>
                  <Text style={styles.tableCellText}>
                    {row.tempValue.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.tableColTime}>
                  <Text style={styles.tableCellText}>
                    {formatDateTime(row.insertTime)}
                  </Text>
                </View>
              </View>
            ))}

            {/* Empty state */}
            {pageData.length === 0 && (
              <View style={[styles.tableRow, { justifyContent: 'center', paddingVertical: 20 }]}>
                <Text style={styles.tableCellText}>ไม่พบข้อมูลในช่วงเวลาที่เลือก</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text>Temperature Monitoring System</Text>
            <Text>
              หน้า {pageIndex + 1} / {pages.length}
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default TempLogReport;
