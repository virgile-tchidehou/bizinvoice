'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image as PdfImage,
} from '@react-pdf/renderer';
import type { Invoice } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#1e293b' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, paddingBottom: 20, borderBottomWidth: 2, borderBottomColor: '#7c3aed', alignItems: 'center' },
  brandGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 24, height: 24 },
  brand: { fontSize: 22, fontWeight: 'bold', color: '#7c3aed' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b', textAlign: 'right' },
  invNum: { fontSize: 11, color: '#64748b', textAlign: 'right', marginTop: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  infoBlock: { width: '45%' },
  label: { fontSize: 8, fontWeight: 'bold', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  txt: { fontSize: 10, color: '#334155', lineHeight: 1.6 },
  tHead: { flexDirection: 'row', backgroundColor: '#7c3aed', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 4 },
  tHeadTxt: { color: '#fff', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },
  tRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tRowAlt: { backgroundColor: '#f8fafc' },
  cDesc: { width: '45%' }, cQty: { width: '15%', textAlign: 'center' }, cPrice: { width: '20%', textAlign: 'right' }, cTotal: { width: '20%', textAlign: 'right' },
  totals: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  totalsBlock: { width: '40%' },
  totRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, paddingHorizontal: 12 },
  totLbl: { fontSize: 10, color: '#64748b' },
  totVal: { fontSize: 10, fontWeight: 'bold', color: '#1e293b' },
  grand: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#7c3aed', borderRadius: 4, marginTop: 4 },
  grandLbl: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
  grandVal: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  notes: { marginTop: 30, padding: 16, backgroundColor: '#f8fafc', borderRadius: 4, borderLeftWidth: 3, borderLeftColor: '#7c3aed' },
  notesTtl: { fontSize: 9, fontWeight: 'bold', color: '#7c3aed', marginBottom: 4, textTransform: 'uppercase' },
  notesTxt: { fontSize: 9, color: '#64748b', lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#94a3b8', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 10 },
});

export default function InvoicePDF({ invoice }: { invoice: Invoice }) {
  const fmt = (d: Date) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const statusLabel = invoice.status === 'paid' ? 'Payée' : 'À payer';

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.brandGroup}>
            <PdfImage src={invoice.companyLogoUrl || "/logo_bizinvoice.png"} style={s.logo} />
            <View>
              <Text style={s.brand}>{invoice.companyName || 'Mon Entreprise'}</Text>
              {invoice.companyAddress ? <Text style={{ fontSize: 9, color: '#64748b', marginTop: 4 }}>{invoice.companyAddress}</Text> : null}
            </View>
          </View>
          <View>
            <Text style={s.title}>FACTURE</Text>
            <Text style={s.invNum}>{invoice.invoiceNumber}</Text>
          </View>
        </View>
        <View style={s.infoRow}>
          <View style={s.infoBlock}>
            <Text style={s.label}>Facturé à</Text>
            <Text style={s.txt}>{invoice.clientName}</Text>
            {invoice.clientEmail ? <Text style={s.txt}>{invoice.clientEmail}</Text> : null}
            {invoice.clientAddress ? <Text style={s.txt}>{invoice.clientAddress}</Text> : null}
          </View>
          <View style={s.infoBlock}>
            <Text style={s.label}>Détails</Text>
            <Text style={s.txt}>Date : {fmt(invoice.createdAt)}</Text>
            <Text style={s.txt}>Échéance : {fmt(invoice.dueDate)}</Text>
            <Text style={s.txt}>Statut : {statusLabel}</Text>
          </View>
        </View>
        <View>
          <View style={s.tHead}>
            <Text style={[s.tHeadTxt, s.cDesc]}>Description</Text>
            <Text style={[s.tHeadTxt, s.cQty]}>Qté</Text>
            <Text style={[s.tHeadTxt, s.cPrice]}>Prix unit.</Text>
            <Text style={[s.tHeadTxt, s.cTotal]}>Total</Text>
          </View>
          {invoice.items.map((item, i) => (
            <View key={i} style={[s.tRow, i % 2 === 1 ? s.tRowAlt : {}]}>
              <Text style={s.cDesc}>{item.description}</Text>
              <Text style={s.cQty}>{item.quantity}</Text>
              <Text style={s.cPrice}>{formatCurrency(item.unitPrice, invoice.currency)}</Text>
              <Text style={s.cTotal}>{formatCurrency(item.quantity * item.unitPrice, invoice.currency)}</Text>
            </View>
          ))}
        </View>
        <View style={s.totals}>
          <View style={s.totalsBlock}>
            <View style={s.totRow}>
              <Text style={s.totLbl}>Sous-total</Text>
              <Text style={s.totVal}>{formatCurrency(invoice.subtotal, invoice.currency)}</Text>
            </View>
            <View style={s.totRow}>
              <Text style={s.totLbl}>Taxe</Text>
              <Text style={s.totVal}>{formatCurrency(invoice.tax, invoice.currency)}</Text>
            </View>
            <View style={s.grand}>
              <Text style={s.grandLbl}>TOTAL</Text>
              <Text style={s.grandVal}>{formatCurrency(invoice.total, invoice.currency)}</Text>
            </View>
          </View>
        </View>
        {invoice.notes ? (
          <View style={s.notes}>
            <Text style={s.notesTtl}>Notes</Text>
            <Text style={s.notesTxt}>{invoice.notes}</Text>
          </View>
        ) : null}
        <Text style={s.footer}>Généré par BizInvoice — {invoice.invoiceNumber}</Text>
      </Page>
    </Document>
  );
}
