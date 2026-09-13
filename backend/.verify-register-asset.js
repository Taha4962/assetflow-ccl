const { registerAssetSchema } = require('./src/utils/zodSchemas');
const payload = {
  departmentId: '1',
  categoryId: '1',
  vendorName: 'Demo Vendor',
  vendorContact: '9999999999',
  invoiceNumber: 'INV-001',
  unitPrice: '45000',
  totalAmount: '45000',
  quantity: '1',
  purchaseDate: '2026-09-01',
  deliveryDate: '',
  notes: ''
};
try {
  const parsed = registerAssetSchema.parse(payload);
  console.log('VALID_OK');
  console.log(JSON.stringify(parsed));
} catch (e) {
  console.log('VALID_ERR');
  console.log(JSON.stringify(e.errors || e.message));
  process.exit(1);
}
