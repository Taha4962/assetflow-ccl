const assetRepo = require('../repositories/asset.repository');
const assignmentRepo = require('../repositories/assignment.repository');
const disposalRepo = require('../repositories/disposal.repository');
const auditRepo = require('../repositories/audit.repository');

const disposeAsset = async (user, assetId, body) => {
  const { reason, condition, disposalDate, notes } = body;

  const asset = await assetRepo.findById(assetId);
  if (!asset) throw { statusCode: 404, message: 'Asset not found' };

  if (asset.status === 'disposed') {
    throw { statusCode: 400, message: 'Asset is already disposed' };
  }

  if (user.role === 'department_manager' && asset.departmentId !== user.departmentId) {
    throw { statusCode: 403, message: 'Forbidden: Asset belongs to another department' };
  }

  // Auto-unassign if currently assigned
  if (asset.status === 'active') {
    await assignmentRepo.returnCurrent(assetId, new Date());
  }

  // Create disposal record
  const disposal = await disposalRepo.create({
    assetId: parseInt(assetId),
    disposedBy: user.id,
    reason,
    condition,
    disposalDate: new Date(disposalDate),
    notes,
  });

  // Update asset status to disposed
  await assetRepo.update(assetId, { status: 'disposed' });

  await auditRepo.logAction({
    userId: user.id,
    assetId: parseInt(assetId),
    action: 'ASSET_DISPOSED',
    description: `Asset ${asset.assetCode} disposed by ${user.fullName}. Reason: ${reason}`,
  });

  return disposal;
};

const getDisposedAssets = async (user, query) => {
  const where = {};
  if (user.role === 'department_manager') where.departmentId = user.departmentId;
  if (query.departmentId && user.role === 'super_admin') where.departmentId = parseInt(query.departmentId);
  return await disposalRepo.findAll(where);
};

module.exports = {
  disposeAsset,
  getDisposedAssets,
};
