import React, { useState, useRef } from 'react'
import { Modal } from '../common/Modal'
import { FileSpreadsheet, FileText, Upload, Download, CheckCircle, AlertTriangle, Database } from 'lucide-react'
import { exportToExcel, exportToCSV, exportToJSON, parseCSVTransactions } from '../../utils/excelExport'

export const ExportImportModal = ({
  isOpen,
  onClose,
  transactions,
  categories,
  categoryBudgets,
  recurring,
  accounts = [],
  debts = [],
  currency = 'USD',
  onImportTransactions,
  onRestoreBackup
}) => {
  const [importStatus, setImportStatus] = useState(null)
  const fileInputCsvRef = useRef(null)
  const fileInputJsonRef = useRef(null)

  const handleExportExcel = () => {
    exportToExcel({
      transactions,
      categories,
      categoryBudgets,
      accounts,
      debts,
      currency,
      filename: `Budget_Export_${new Date().toISOString().split('T')[0]}.xlsx`
    })
    setImportStatus({ success: true, message: 'Excel workbook (.xlsx) with Bank Accounts & Debts generated!' })
  }

  const handleExportCSV = () => {
    exportToCSV({
      transactions,
      categories,
      filename: `Transactions_${new Date().toISOString().split('T')[0]}.csv`
    })
    setImportStatus({ success: true, message: 'CSV file exported successfully!' })
  }

  const handleExportJSON = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      currency,
      transactions,
      categories,
      categoryBudgets,
      recurring,
      accounts,
      debts
    }
    exportToJSON(backupData, `Budget_Full_Backup_${new Date().toISOString().split('T')[0]}.json`)
    setImportStatus({ success: true, message: 'Full JSON backup downloaded!' })
  }

  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result
        const parsed = parseCSVTransactions(text, categories)
        if (parsed.length === 0) {
          setImportStatus({ success: false, message: 'No valid transaction records found in CSV file.' })
          return
        }
        onImportTransactions(parsed)
        setImportStatus({ success: true, message: `Successfully imported ${parsed.length} transactions from CSV!` })
      } catch (err) {
        setImportStatus({ success: false, message: 'Failed to parse CSV file. Please check format.' })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleJSONUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result)
        if (!data.transactions) {
          setImportStatus({ success: false, message: 'Invalid backup file structure.' })
          return
        }
        onRestoreBackup(data)
        setImportStatus({ success: true, message: 'Full backup restored successfully!' })
      } catch (err) {
        setImportStatus({ success: false, message: 'Failed to restore JSON backup.' })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setImportStatus(null)
        onClose()
      }}
      title="Export & Import Financial Data"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {importStatus && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              importStatus.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
            }`}
          >
            {importStatus.success ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        {/* 1. Microsoft Excel Export Section (Highlighted) */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Microsoft Excel (.xlsx)
                  <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Multi-sheet workbook with Transactions, Category Budgets & Monthly Summary.
                </p>
              </div>
            </div>

            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .xlsx</span>
            </button>
          </div>
        </div>

        {/* 2. CSV Export & Import Section */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  CSV Spreadsheet (.csv)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Universal spreadsheet format compatible with Excel and Google Sheets.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
                title="Download CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>

              <button
                onClick={() => fileInputCsvRef.current?.click()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 shadow-xs"
                title="Import CSV"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import</span>
              </button>
              <input
                ref={fileInputCsvRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* 3. JSON Complete Backup & Restore */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Full Application Backup (.json)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Backup all data, categories, and settings to a JSON file or restore from a previous save.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportJSON}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Backup</span>
              </button>

              <button
                onClick={() => fileInputJsonRef.current?.click()}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore</span>
              </button>
              <input
                ref={fileInputJsonRef}
                type="file"
                accept=".json"
                onChange={handleJSONUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center pt-2">
          Your data is stored securely in your browser's local storage and is never uploaded to any remote server.
        </div>
      </div>
    </Modal>
  )
}
