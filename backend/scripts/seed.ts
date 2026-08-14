import bcrypt from 'bcrypt';
import { execQuery } from './migrate';

interface PermissionDef {
  module: string;
  action: string;
  key: string;
  description?: string;
}

const permissions: PermissionDef[] = [
  { module: 'system', action: 'settings.read', key: 'system.settings.read' },
  { module: 'system', action: 'settings.write', key: 'system.settings.write' },
  { module: 'audit', action: 'read', key: 'audit.read' },
  { module: 'users', action: 'read', key: 'users.read' },
  { module: 'users', action: 'create', key: 'users.create' },
  { module: 'users', action: 'update', key: 'users.update' },
  { module: 'users', action: 'delete', key: 'users.delete' },
  { module: 'roles', action: 'read', key: 'roles.read' },
  { module: 'roles', action: 'create', key: 'roles.create' },
  { module: 'roles', action: 'update', key: 'roles.update' },
  { module: 'roles', action: 'delete', key: 'roles.delete' },
  { module: 'permissions', action: 'read', key: 'permissions.read' },
  { module: 'branches', action: 'read', key: 'branches.read' },
  { module: 'branches', action: 'create', key: 'branches.create' },
  { module: 'branches', action: 'update', key: 'branches.update' },
  { module: 'branches', action: 'delete', key: 'branches.delete' },
  { module: 'hotel', action: 'room_types.read', key: 'hotel.room_types.read' },
  { module: 'hotel', action: 'room_types.write', key: 'hotel.room_types.write' },
  { module: 'hotel', action: 'rooms.read', key: 'hotel.rooms.read' },
  { module: 'hotel', action: 'rooms.write', key: 'hotel.rooms.write' },
  { module: 'hotel', action: 'guests.read', key: 'hotel.guests.read' },
  { module: 'hotel', action: 'guests.write', key: 'hotel.guests.write' },
  { module: 'hotel', action: 'reservation.read', key: 'hotel.reservation.read' },
  { module: 'hotel', action: 'reservation.create', key: 'hotel.reservation.create' },
  { module: 'hotel', action: 'reservation.update', key: 'hotel.reservation.update' },
  { module: 'hotel', action: 'reservation.cancel', key: 'hotel.reservation.cancel' },
  { module: 'hotel', action: 'checkin.create', key: 'hotel.checkin.create' },
  { module: 'hotel', action: 'checkin.update', key: 'hotel.checkin.update' },
  { module: 'hotel', action: 'checkout.create', key: 'hotel.checkout.create' },
  { module: 'hotel', action: 'billing.read', key: 'hotel.billing.read' },
  { module: 'hotel', action: 'billing.write', key: 'hotel.billing.write' },
  { module: 'pos', action: 'category.read', key: 'pos.category.read' },
  { module: 'pos', action: 'category.write', key: 'pos.category.write' },
  { module: 'pos', action: 'product.read', key: 'pos.product.read' },
  { module: 'pos', action: 'product.write', key: 'pos.product.write' },
  { module: 'pos', action: 'table.read', key: 'pos.table.read' },
  { module: 'pos', action: 'table.write', key: 'pos.table.write' },
  { module: 'pos', action: 'order.read', key: 'pos.order.read' },
  { module: 'pos', action: 'order.create', key: 'pos.order.create' },
  { module: 'pos', action: 'order.update', key: 'pos.order.update' },
  { module: 'pos', action: 'order.cancel', key: 'pos.order.cancel' },
  { module: 'pos', action: 'kot.read', key: 'pos.kot.read' },
  { module: 'pos', action: 'kot.write', key: 'pos.kot.write' },
  { module: 'pos', action: 'payment.create', key: 'pos.payment.create' },
  { module: 'pos', action: 'reports.read', key: 'pos.reports.read' },
  { module: 'catering', action: 'package.read', key: 'catering.package.read' },
  { module: 'catering', action: 'package.write', key: 'catering.package.write' },
  { module: 'catering', action: 'event.read', key: 'catering.event.read' },
  { module: 'catering', action: 'event.write', key: 'catering.event.write' },
  { module: 'catering', action: 'quotation.read', key: 'catering.quotation.read' },
  { module: 'catering', action: 'quotation.write', key: 'catering.quotation.write' },
  { module: 'inventory', action: 'item.read', key: 'inventory.item.read' },
  { module: 'inventory', action: 'item.write', key: 'inventory.item.write' },
  { module: 'inventory', action: 'supplier.read', key: 'inventory.supplier.read' },
  { module: 'inventory', action: 'supplier.write', key: 'inventory.supplier.write' },
  { module: 'inventory', action: 'po.read', key: 'inventory.po.read' },
  { module: 'inventory', action: 'po.write', key: 'inventory.po.write' },
  { module: 'inventory', action: 'grn.read', key: 'inventory.grn.read' },
  { module: 'inventory', action: 'grn.write', key: 'inventory.grn.write' },
  { module: 'inventory', action: 'stock.adjust', key: 'inventory.stock.adjust' },
  { module: 'inventory', action: 'recipe.read', key: 'inventory.recipe.read' },
  { module: 'inventory', action: 'recipe.write', key: 'inventory.recipe.write' },
  { module: 'hr', action: 'employee.read', key: 'hr.employee.read' },
  { module: 'hr', action: 'employee.write', key: 'hr.employee.write' },
  { module: 'hr', action: 'attendance.read', key: 'hr.attendance.read' },
  { module: 'hr', action: 'attendance.write', key: 'hr.attendance.write' },
  { module: 'hr', action: 'leave.read', key: 'hr.leave.read' },
  { module: 'hr', action: 'leave.write', key: 'hr.leave.write' },
  { module: 'hr', action: 'payroll.read', key: 'hr.payroll.read' },
  { module: 'hr', action: 'payroll.write', key: 'hr.payroll.write' },
  { module: 'hr', action: 'payroll.run', key: 'hr.payroll.run' },
  { module: 'finance', action: 'expense.read', key: 'finance.expense.read' },
  { module: 'finance', action: 'expense.write', key: 'finance.expense.write' },
  { module: 'finance', action: 'reconciliation.read', key: 'finance.reconciliation.read' },
  { module: 'finance', action: 'reconciliation.write', key: 'finance.reconciliation.write' },
  { module: 'finance', action: 'reports.read', key: 'finance.reports.read' },
  { module: 'reports', action: 'dashboard.read', key: 'reports.dashboard.read' },
  { module: 'reports', action: 'export', key: 'reports.export' },
];

const allKeys = permissions.map((p) => p.key);

interface RoleDef {
  code: string;
  name: string;
  description?: string;
  is_system: boolean;
  permissions: string[];
}

const roles: RoleDef[] = [
  { code: 'SUPER_ADMIN', name: 'Super Admin', description: 'Full access across all branches', is_system: true, permissions: allKeys },
  { code: 'HEAD_OFFICE_MANAGER', name: 'Head Office Manager', description: 'Oversight & reporting across branches', is_system: true, permissions: ['branches.read', 'users.read', 'roles.read', 'permissions.read', 'audit.read', 'system.settings.read', 'system.settings.write', 'hotel.rooms.read', 'hotel.reservation.read', 'hotel.billing.read', 'pos.product.read', 'pos.order.read', 'pos.reports.read', 'catering.event.read', 'catering.quotation.read', 'inventory.item.read', 'finance.reports.read', 'reports.dashboard.read', 'reports.export'] },
  { code: 'HOTEL_MANAGER', name: 'Hotel Manager', description: "Manages Ernie's Retreat accommodation", is_system: true, permissions: ['system.settings.read', 'hotel.room_types.read', 'hotel.room_types.write', 'hotel.rooms.read', 'hotel.rooms.write', 'hotel.guests.read', 'hotel.guests.write', 'hotel.reservation.read', 'hotel.reservation.create', 'hotel.reservation.update', 'hotel.reservation.cancel', 'hotel.checkin.create', 'hotel.checkin.update', 'hotel.checkout.create', 'hotel.billing.read', 'hotel.billing.write', 'reports.dashboard.read', 'reports.export'] },
  { code: 'RESTAURANT_MANAGER', name: 'Restaurant Manager', description: "Manages Nanga's Kitchen POS & catering", is_system: true, permissions: ['system.settings.read', 'pos.category.read', 'pos.category.write', 'pos.product.read', 'pos.product.write', 'pos.table.read', 'pos.table.write', 'pos.order.read', 'pos.order.create', 'pos.order.update', 'pos.order.cancel', 'pos.kot.read', 'pos.kot.write', 'pos.payment.create', 'pos.reports.read', 'catering.package.read', 'catering.package.write', 'catering.event.read', 'catering.event.write', 'catering.quotation.read', 'catering.quotation.write', 'inventory.item.read', 'inventory.recipe.read', 'reports.dashboard.read', 'reports.export'] },
  { code: 'CASHIER', name: 'Cashier', is_system: false, permissions: ['pos.table.read', 'pos.product.read', 'pos.order.read', 'pos.order.create', 'pos.order.update', 'pos.order.cancel', 'pos.payment.create', 'pos.reports.read'] },
  { code: 'RECEPTIONIST', name: 'Receptionist', is_system: false, permissions: ['hotel.rooms.read', 'hotel.guests.read', 'hotel.guests.write', 'hotel.reservation.read', 'hotel.reservation.create', 'hotel.reservation.update', 'hotel.reservation.cancel', 'hotel.checkin.create', 'hotel.checkin.update', 'hotel.checkout.create', 'hotel.billing.read'] },
  { code: 'KITCHEN_STAFF', name: 'Kitchen Staff', is_system: false, permissions: ['pos.kot.read', 'pos.kot.write', 'pos.order.read'] },
  { code: 'STORE_KEEPER', name: 'Store Keeper', is_system: false, permissions: ['inventory.item.read', 'inventory.item.write', 'inventory.supplier.read', 'inventory.supplier.write', 'inventory.po.read', 'inventory.po.write', 'inventory.grn.read', 'inventory.grn.write', 'inventory.stock.adjust', 'inventory.recipe.read'] },
  { code: 'HR_MANAGER', name: 'HR Manager', is_system: false, permissions: ['hr.employee.read', 'hr.employee.write', 'hr.attendance.read', 'hr.attendance.write', 'hr.leave.read', 'hr.leave.write', 'hr.payroll.read', 'hr.payroll.write', 'hr.payroll.run'] },
  { code: 'ACCOUNTANT', name: 'Accountant', is_system: false, permissions: ['finance.expense.read', 'finance.expense.write', 'finance.reconciliation.read', 'finance.reconciliation.write', 'finance.reports.read', 'pos.reports.read', 'inventory.item.read', 'reports.export', 'reports.dashboard.read'] },
  { code: 'EMPLOYEE', name: 'Employee', is_system: false, permissions: ['hr.attendance.read', 'hr.leave.read', 'hr.leave.write'] },
];

async function insertOnce(table: string, filterSql: string, filterParams: unknown[]): Promise<boolean> {
  const existing: unknown[] = (await execQuery(`SELECT 1 FROM ${table} WHERE ${filterSql} LIMIT 1`, filterParams)) as unknown[];
  return existing.length === 0;
}

async function main(): Promise<void> {
  const adminExists = (await execQuery("SELECT 1 FROM users WHERE username = 'superadmin' LIMIT 1")) as unknown[];
  if (adminExists.length > 0) {
    console.log('[seed] already seeded; skipping');
    return;
  }

  // branches
  const branchCodes = ['HO', 'ERRET', 'NANGA'];
  const branchInfo = [
    { code: 'HO', name: 'Waikkal Hospitality Head Office', type: 'HEAD_OFFICE', phone: '+94 31 555 0100' },
    { code: 'ERRET', name: "Ernie's Retreat – Waikkal Beach Villa", type: 'VILLA', phone: '+94 31 555 0101' },
    { code: 'NANGA', name: "Nanga's Kitchen – Restaurant & Catering", type: 'RESTAURANT', phone: '+94 31 555 0102' },
  ];
  const branchIds = new Map<string, number>();
  for (const b of branchInfo) {
    const r = await execQuery('INSERT INTO branches (code, name, type, address, phone, email, currency, timezone, status) VALUES (?,?,?,?,?,?,?,?,?)', [b.code, b.name, b.type, 'Beach Road, Waikkal', b.phone, `${b.code.toLowerCase()}@waikkalhospitality.lk`, 'LKR', 'Asia/Colombo', 'ACTIVE']);
    branchIds.set(b.code, (r as { insertId: number }).insertId);
  }

  // permissions
  const permByKey = new Map<string, number>();
  for (const p of permissions) {
    const r = await execQuery('INSERT INTO permissions (module, action, `key`, description) VALUES (?,?,?,?)', [p.module, p.action, p.key, p.description ?? null]);
    permByKey.set(p.key, (r as { insertId: number }).insertId);
  }

  // roles + role_permissions
  const roleIds = new Map<string, number>();
  for (const role of roles) {
    const r = await execQuery('INSERT INTO roles (code, name, description, is_system) VALUES (?,?,?,?)', [role.code, role.name, role.description ?? null, role.is_system]);
    const roleId = (r as { insertId: number }).insertId;
    roleIds.set(role.code, roleId);
    for (const key of new Set(role.permissions)) {
      const permId = permByKey.get(key);
      if (permId) await execQuery('INSERT INTO role_permissions (role_id, permission_id) VALUES (?,?)', [roleId, permId]);
    }
  }

  // bootstrap super admin
  const superHash = bcrypt.hashSync(process.env.BOOTSTRAP_ADMIN_PASSWORD ?? 'ChangeMe!123', 12);
  const adminR = await execQuery("INSERT INTO users (branch_id, username, email, password_hash, full_name, status, must_change_password) VALUES (?,?,?,?,?,?,?)", [branchIds.get('HO'), 'superadmin', 'admin@waikkalhospitality.lk', superHash, 'System Administrator', 'active', true]);
  const adminId = (adminR as { insertId: number }).insertId;
  for (const [i, code] of branchCodes.entries()) {
    await execQuery('INSERT INTO user_branch_access (user_id, branch_id, is_primary) VALUES (?,?,?)', [adminId, branchIds.get(code), i === 0]);
  }
  await execQuery('INSERT INTO user_roles (user_id, role_id) VALUES (?,?)', [adminId, roleIds.get('SUPER_ADMIN')]);

  // demo users
  const demos = [
    { username: 'ho.manager', email: 'ho.manager@waikkalhospitality.lk', full_name: 'Head Office Manager', roleCode: 'HEAD_OFFICE_MANAGER', branches: ['HO', 'ERRET', 'NANGA'] },
    { username: 'hotel.manager', email: 'hotel.manager@erniesretreat.lk', full_name: 'Hotel Manager', roleCode: 'HOTEL_MANAGER', branches: ['ERRET'] },
    { username: 'restaurant.manager', email: 'restaurant.manager@nangaskitchen.lk', full_name: 'Restaurant Manager', roleCode: 'RESTAURANT_MANAGER', branches: ['NANGA'] },
    { username: 'cashier', email: 'cashier@nangaskitchen.lk', full_name: 'Kavinda Perera', roleCode: 'CASHIER', branches: ['NANGA'] },
    { username: 'receptionist', email: 'receptionist@erniesretreat.lk', full_name: 'Nadeesha Silva', roleCode: 'RECEPTIONIST', branches: ['ERRET'] },
    { username: 'kitchen', email: 'kitchen@nangaskitchen.lk', full_name: 'Chef Ruwan', roleCode: 'KITCHEN_STAFF', branches: ['NANGA'] },
    { username: 'storekeeper', email: 'store@waikkalhospitality.lk', full_name: 'Store Keeper', roleCode: 'STORE_KEEPER', branches: ['HO', 'ERRET', 'NANGA'] },
    { username: 'hr.manager', email: 'hr@waikkalhospitality.lk', full_name: 'HR Manager', roleCode: 'HR_MANAGER', branches: ['HO', 'ERRET', 'NANGA'] },
    { username: 'accountant', email: 'accounts@waikkalhospitality.lk', full_name: 'Accountant', roleCode: 'ACCOUNTANT', branches: ['HO', 'ERRET', 'NANGA'] },
  ];
  for (const d of demos) {
    const hash = bcrypt.hashSync('DemoUser!1', 12);
    const ur = await execQuery('INSERT INTO users (branch_id, username, email, password_hash, full_name, status) VALUES (?,?,?,?,?,?)', [branchIds.get(d.branches[0]), d.username, d.email, hash, d.full_name, 'active']);
    const uid = (ur as { insertId: number }).insertId;
    for (const [i, code] of d.branches.entries()) {
      await execQuery('INSERT INTO user_branch_access (user_id, branch_id, is_primary) VALUES (?,?,?)', [uid, branchIds.get(code), i === 0]);
    }
    await execQuery('INSERT INTO user_roles (user_id, role_id) VALUES (?,?)', [uid, roleIds.get(d.roleCode)]);
  }

  // settings
  await execQuery('INSERT INTO settings (branch_id, `key`, value_json) VALUES (?,?,?)', [branchIds.get('HO'), 'tax.rates', JSON.stringify({ vat: 0, nbt: 0, service: 10 })]);
  await execQuery('INSERT INTO settings (branch_id, `key`, value_json) VALUES (?,?,?)', [branchIds.get('NANGA'), 'tax.rates', JSON.stringify({ vat: 0, nbt: 0, service: 10 })]);
  await execQuery('INSERT INTO settings (branch_id, `key`, value_json) VALUES (?,?,?)', [branchIds.get('ERRET'), 'tax.rates', JSON.stringify({ vat: 0, nbt: 0, service: 10 })]);

  // expense categories
  for (const name of ['Utilities', 'Salaries & Wages', 'Food & Beverage Supplies', 'Maintenance & Repairs', 'Marketing', 'Other']) {
    await execQuery('INSERT INTO expense_categories (name) VALUES (?)', [name]);
  }

  // demo accommodation (Ernie's Retreat)
  const erret = branchIds.get('ERRET')!;
  const typeRows: Array<{ insertId: number }> = [];
  for (const rt of [
    { name: 'Sea View Room', desc: 'Queen bed, sea view balcony', rate: 18500, guests: 2 },
    { name: 'Garden Room', desc: 'Double bed, garden view', rate: 12500, guests: 2 },
    { name: 'Family Suite', desc: 'Two bedrooms, ocean view', rate: 42000, guests: 5 },
  ]) {
    const r = await execQuery('INSERT INTO room_types (branch_id, name, description, base_rate, max_guests, amenities_json) VALUES (?,?,?,?,?,?)', [erret, rt.name, rt.desc, rt.rate, rt.guests, JSON.stringify(['AC', 'WiFi'])]);
    typeRows.push(r as { insertId: number });
  }
  const [sv, gr, fs] = typeRows.map((r) => r.insertId);
  const roomRows: Array<[number, number, string, string]> = [];
  for (let i = 1; i <= 8; i++) roomRows.push([erret, sv, `SV-${i}`, '1']);
  for (let i = 1; i <= 6; i++) roomRows.push([erret, gr, `GR-${i}`, 'Ground']);
  roomRows.push([erret, fs, 'FS-1', '1']);
  roomRows.push([erret, fs, 'FS-2', '1']);
  for (const [b, t, num, floor] of roomRows) {
    await execQuery('INSERT INTO rooms (branch_id, room_type_id, room_number, floor) VALUES (?,?,?,?)', [b, t, num, floor]);
  }

  // demo POS (Nanga's Kitchen)
  const nanga = branchIds.get('NANGA')!;
  const catIds: number[] = [];
  for (const name of ['Starters', 'Main Course', 'Rice & Curry', 'Beverages']) {
    const r = await execQuery('INSERT INTO categories (branch_id, name, sort_order) VALUES (?,?,?)', [nanga, name, catIds.length + 1]);
    catIds.push((r as { insertId: number }).insertId);
  }
  const products = [
    ['Deviled Prawns', 'NAN-DEV-PRAWN', 2400, 1300, 'WOK'],
    ['Fish Cutlets (2pcs)', 'NAN-FISH-CUT', 950, 420, 'FRY'],
    ['Jumbo Prawn Curry', 'NAN-PRAWN-CURRY', 2800, 1550, 'CURRY'],
    ['Grilled Chicken', 'NAN-GRILL-CHIX', 1900, 980, 'GRILL'],
    ['Seafood Fried Rice', 'NAN-SEAFOOD-RICE', 1600, 720, 'RICE'],
    ['Rice & Curry (veg)', 'NAN-RICE-VEG', 850, 340, 'RICE'],
    ['King Coconut', 'NAN-COCONUT', 350, 120, 'BAR'],
    ['Fresh Lime Soda', 'NAN-LIME-SODA', 450, 110, 'BAR'],
  ];
  const catByIndex = (idx: number) => catIds[idx];
  for (const [i, p] of products.entries()) {
    const cat = i < 2 ? 0 : i < 4 ? 1 : i < 6 ? 2 : 3;
    await execQuery('INSERT INTO products (branch_id, category_id, name, sku, price, cost, tax_rate, kitchen_station) VALUES (?,?,?,?,?,?,0,?)', [nanga, catByIndex(cat), p[0], p[1], p[2], p[3], p[4]]);
  }
  for (const [i, name] of ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'].entries()) {
    await execQuery('INSERT INTO tables (branch_id, name, capacity, location, status) VALUES (?,?,?,?,?)', [nanga, name, i < 2 ? 2 : 4, 'Garden', 'AVAILABLE']);
  }

  // demo inventory (Head Office store)
  const ho = branchIds.get('HO')!;
  for (const it of [
    ['Coconut Oil (5L)', 'STK-OIL-5L', 'RAW_MATERIAL', 'tin', 24, 6, 6200],
    ['Basmati Rice (50kg)', 'STK-RICE-50', 'RAW_MATERIAL', 'bag', 18, 4, 16500],
    ['Chicken (whole, kg)', 'STK-CHIX-KG', 'RAW_MATERIAL', 'kg', 40, 10, 1400],
    ['Prawns (kg)', 'STK-PRAWN-KG', 'RAW_MATERIAL', 'kg', 3, 8, 3200],
    ['Bathroom Tissue (box)', 'STK-TISSUE-BOX', 'CONSUMABLE', 'box', 30, 10, 900],
    ['LED Bulb', 'STK-LED-10W', 'CONSUMABLE', 'pcs', 12, 5, 850],
  ]) {
    await execQuery('INSERT INTO inventory (branch_id, name, sku, category, unit, quantity_on_hand, reorder_level, cost) VALUES (?,?,?,?,?,?,?,?)', [ho, it[0], it[1], it[2], it[3], it[4], it[5], it[6]]);
  }

  console.log('[seed] done');
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  main()
    .then(async () => {
      const { sqlConn } = await import('./migrate');
      await sqlConn.end();
    })
    .catch(async (e) => {
      console.error('[seed] ERROR:', e);
      const { sqlConn } = await import('./migrate');
      await sqlConn.end();
      process.exit(1);
    });
}
