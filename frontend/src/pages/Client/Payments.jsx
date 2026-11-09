
import { useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Search,
  Download,
  Eye,
  X,
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  Receipt,
  TrendingUp,
} from "lucide-react";

import "./Payments.css";

const sampleTransactions = [
  {
    id: "TXN-2026-001",
    description: "E-commerce Website Development",
    freelancer: "Abebe Kebede",
    type: "PAYMENT",
    amount: 30000,
    fee: 600,
    total: 30600,
    status: "COMPLETED",
    method: "Chapa",
    date: "2026-11-07",
    reference: "CHP-847291",
  },
  {
    id: "TXN-2026-002",
    description: "Mobile Banking UI Design",
    freelancer: "Sara Mohammed",
    type: "PAYMENT",
    amount: 16000,
    fee: 320,
    total: 16320,
    status: "PENDING",
    method: "Chapa",
    date: "2026-11-06",
    reference: "CHP-847292",
  },
  {
    id: "TXN-2026-003",
    description: "Business Logo and Branding",
    freelancer: "Dawit Tesfaye",
    type: "REFUND",
    amount: 8000,
    fee: 0,
    total: 8000,
    status: "COMPLETED",
    method: "Chapa",
    date: "2026-11-04",
    reference: "CHP-847293",
  },
  {
    id: "TXN-2026-004",
    description: "Website Maintenance",
    freelancer: "Mekdes Alemu",
    type: "PAYMENT",
    amount: 12000,
    fee: 240,
    total: 12240,
    status: "FAILED",
    method: "Chapa",
    date: "2026-11-02",
    reference: "CHP-847294",
  },
  {
    id: "TXN-2026-005",
    description: "Mobile App Development",
    freelancer: "Yonas Bekele",
    type: "PAYMENT",
    amount: 45000,
    fee: 900,
    total: 45900,
    status: "COMPLETED",
    method: "Chapa",
    date: "2026-10-28",
    reference: "CHP-847295",
  },
];

export default function Payments() {
  const [transactions, setTransactions] = useState(sampleTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const completedPayments = transactions
    .filter((item) => item.type === "PAYMENT" && item.status === "COMPLETED")
    .reduce((sum, item) => sum + item.total, 0);

  const pendingPayments = transactions
    .filter((item) => item.type === "PAYMENT" && item.status === "PENDING")
    .reduce((sum, item) => sum + item.total, 0);

  const refunds = transactions
    .filter((item) => item.type === "REFUND" && item.status === "COMPLETED")
    .reduce((sum, item) => sum + item.amount, 0);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = [
      transaction.id,
      transaction.description,
      transaction.freelancer,
      transaction.reference,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === "ALL" ||
      transaction.status === activeFilter ||
      transaction.type === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount) =>
    `${Number(amount).toLocaleString("en-US")} ETB`;

  const formatDate = (date) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getStatusIcon = (status) => {
    if (status === "COMPLETED") return <CheckCircle2 size={14} />;
    if (status === "PENDING") return <Clock size={14} />;
    return <XCircle size={14} />;
  };

  const exportTransactions = () => {
    const headers = [
      "Transaction ID",
      "Description",
      "Freelancer",
      "Type",
      "Amount",
      "Fee",
      "Total",
      "Status",
      "Method",
      "Date",
    ];

    const rows = filteredTransactions.map((item) => [
      item.id,
      item.description,
      item.freelancer,
      item.type,
      item.amount,
      item.fee,
      item.total,
      item.status,
      item.method,
      item.date,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ethiolance-transactions.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="ethio-payments">
      {/* Header */}
      <div className="ethio-payments-header">
        <div>
          <span className="ethio-payments-eyebrow">
            FINANCIAL MANAGEMENT
          </span>
          <h1>Payments & Transactions</h1>
          <p>Manage your payments and track your transaction history.</p>
        </div>

        <button
          className="ethio-payments-export-btn"
          onClick={exportTransactions}
        >
          <Download size={17} />
          Export Transactions
        </button>
      </div>

      {/* Statistics */}
      <section className="ethio-payments-stats">
        <div className="ethio-payment-stat-card">
          <div className="ethio-payment-stat-icon total">
            <Wallet size={22} />
          </div>
          <div>
            <span>Total Transactions</span>
            <h2>{transactions.length}</h2>
            <small>All recorded transactions</small>
          </div>
        </div>

        <div className="ethio-payment-stat-card">
          <div className="ethio-payment-stat-icon completed">
            <ArrowUpRight size={22} />
          </div>
          <div>
            <span>Completed Payments</span>
            <h2>{formatCurrency(completedPayments)}</h2>
            <small>Successfully processed</small>
          </div>
        </div>

        <div className="ethio-payment-stat-card">
          <div className="ethio-payment-stat-icon pending">
            <Clock size={22} />
          </div>
          <div>
            <span>Pending Payments</span>
            <h2>{formatCurrency(pendingPayments)}</h2>
            <small>Awaiting confirmation</small>
          </div>
        </div>

        <div className="ethio-payment-stat-card">
          <div className="ethio-payment-stat-icon refunds">
            <ArrowDownLeft size={22} />
          </div>
          <div>
            <span>Total Refunds</span>
            <h2>{formatCurrency(refunds)}</h2>
            <small>Successfully refunded</small>
          </div>
        </div>
      </section>

      {/* Transaction History */}
      <section className="ethio-payments-panel">
        <div className="ethio-payments-panel-header">
          <div>
            <h2>Transaction History</h2>
            <p>Review all your financial activities.</p>
          </div>

          <div className="ethio-payments-record-count">
            {filteredTransactions.length} Records
          </div>
        </div>

        {/* Search and Filter */}
        <div className="ethio-payments-toolbar">
          <div className="ethio-payments-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <select
            className="ethio-payments-filter"
            value={activeFilter}
            onChange={(event) => setActiveFilter(event.target.value)}
          >
            <option value="ALL">All Transactions</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="PAYMENT">Payments</option>
            <option value="REFUND">Refunds</option>
          </select>
        </div>

        {/* Table */}
        <div className="ethio-payments-table-wrapper">
          <table className="ethio-payments-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Freelancer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <div className="ethio-payment-transaction">
                        <div
                          className={`ethio-payment-type-icon ${
                            transaction.type === "REFUND"
                              ? "refund"
                              : "payment"
                          }`}
                        >
                          {transaction.type === "REFUND" ? (
                            <ArrowDownLeft size={18} />
                          ) : (
                            <ArrowUpRight size={18} />
                          )}
                        </div>

                        <div>
                          <strong>{transaction.description}</strong>
                          <span>{transaction.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>{transaction.freelancer}</td>

                    <td>
                      <strong className="ethio-payment-amount">
                        {formatCurrency(transaction.total)}
                      </strong>
                    </td>

                    <td>
                      <span className="ethio-payment-method">
                        <CreditCard size={14} />
                        {transaction.method}
                      </span>
                    </td>

                    <td>{formatDate(transaction.date)}</td>

                    <td>
                      <span
                        className={`ethio-payment-status ${transaction.status.toLowerCase()}`}
                      >
                        {getStatusIcon(transaction.status)}
                        {transaction.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="ethio-payment-view-btn"
                        title="View transaction details"
                        onClick={() =>
                          setSelectedTransaction(transaction)
                        }
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="ethio-payments-empty">
                      <Receipt size={30} />
                      <h3>No transactions found</h3>
                      <p>Try changing your search or filter.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div
          className="ethio-payment-modal-overlay"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="ethio-payment-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ethio-payment-modal-header">
              <div>
                <h2>Transaction Details</h2>
                <p>Review transaction information</p>
              </div>

              <button
                onClick={() => setSelectedTransaction(null)}
                aria-label="Close transaction details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="ethio-payment-modal-amount">
              <span>Transaction Amount</span>
              <h2>{formatCurrency(selectedTransaction.total)}</h2>
              <span
                className={`ethio-payment-status ${selectedTransaction.status.toLowerCase()}`}
              >
                {getStatusIcon(selectedTransaction.status)}
                {selectedTransaction.status}
              </span>
            </div>

            <div className="ethio-payment-detail-list">
              <div>
                <span>Transaction ID</span>
                <strong>{selectedTransaction.id}</strong>
              </div>

              <div>
                <span>Project</span>
                <strong>{selectedTransaction.description}</strong>
              </div>

              <div>
                <span>Freelancer</span>
                <strong>{selectedTransaction.freelancer}</strong>
              </div>

              <div>
                <span>Transaction Type</span>
                <strong>{selectedTransaction.type}</strong>
              </div>

              <div>
                <span>Payment Amount</span>
                <strong>{formatCurrency(selectedTransaction.amount)}</strong>
              </div>

              <div>
                <span>Transaction Fee</span>
                <strong>{formatCurrency(selectedTransaction.fee)}</strong>
              </div>

              <div>
                <span>Payment Method</span>
                <strong>{selectedTransaction.method}</strong>
              </div>

              <div>
                <span>Payment Date</span>
                <strong>{formatDate(selectedTransaction.date)}</strong>
              </div>

              <div>
                <span>Reference Number</span>
                <strong>{selectedTransaction.reference}</strong>
              </div>
            </div>

            <button
              className="ethio-payment-modal-close-btn"
              onClick={() => setSelectedTransaction(null)}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
