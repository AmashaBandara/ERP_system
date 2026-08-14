import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcrypt';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface PermissionDef { module: string; action: string; key: string; description?: string }
interface RoleDef { code: string; name: string; description?: string; is_system: boolean; permissions: string[] }

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

const q = (v: unknown): string =>
  v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`;

async function main(): Promise<void> {
  const lines: string[] = [];
  lines.push('SET FOREIGN_KEY_CHECKS=0;');

  // branches (explicit ids 1..3)
  lines.push(`INSERT INTO branches (id, code, name, type, address, phone, email, currency, timezone, status) VALUES
  (1, 'HO', 'Waikkal Hospitality Head Office', 'HEAD_OFFICE', 'No. 12, Beach Road, Waikkal', '+94 31 555 0100', 'headoffice@waikkalhospitality.lk', 'LKR', 'Asia/Colombo', 'ACTIVE'),
  (2, 'ERRET', ${q("Ernie's Retreat – Waikkal Beach Villa")}, 'VILLA', 'Beach Road, Waikkal', '+94 31 555 0101', 'reservations@erniesretreat.lk', 'LKR', 'Asia/Colombo', 'ACTIVE'),
  (3, 'NANGA', ${q("Nanga's Kitchen – Restaurant & Catering")}, 'RESTAURANT', 'Beach Road, Waikkal', '+94 31 555 0102', 'hello@nangaskitchen.lk', 'LKR', 'Asia/Colombo', 'ACTIVE');`);

  // permissions (explicit ids 1..N)
  const permByKey = new Map<string, number>();
  permissions.forEach((p, i) => {
    const id = i + 1;
    permByKey.set(p.key, id);
    lines.push(`INSERT INTO permissions (id, module, action, \`key\`, description) VALUES (${id}, ${q(p.module)}, ${q(p.action)}, ${q(p.key)}, ${q(p.description ?? null)});`);
  });

  // roles
  const roleIds = new Map<string, number>();
  roles.forEach((r, i) => {
    const id = i + 1;
    roleIds.set(r.code, id);
    lines.push(`INSERT INTO roles (id, code, name, description, is_system) VALUES (${id}, ${q(r.code)}, ${q(r.name)}, ${q(r.description ?? null)}, ${r.is_system ? 1 : 0});`);
  });
  for (const r of roles) {
    for (const key of new Set(r.permissions)) {
      const pid = permByKey.get(key);
      if (pid) lines.push(`INSERT INTO role_permissions (role_id, permission_id) VALUES (${roleIds.get(r.code)}, ${pid});`);
    }
  }

  // admin + demo users (explicit ids)
  const superHash = bcrypt.hashSync(process.env.BOOTSTRAP_ADMIN_PASSWORD ?? 'ChangeMe!123', 12);
  const usersSql: string[] = [];
  usersSql.push(`INSERT INTO users (id, branch_id, username, email, password_hash, full_name, status, must_change_password) VALUES (1, 1, 'superadmin', 'admin@waikkalhospitality.lk', '${superHash}', 'System Administrator', 'active', 1);`);
  const demos = [
    { id: 2, uname: 'ho.manager', email: 'ho.manager@waikkalhospitality.lk', full: 'Head Office Manager', role: 'HEAD_OFFICE_MANAGER', branches: [1, 2, 3] },
    { id: 3, uname: 'hotel.manager', email: 'hotel.manager@erniesretreat.lk', full: 'Hotel Manager', role: 'HOTEL_MANAGER', branches: [2] },
    { id: 4, uname: 'restaurant.manager', email: 'restaurant.manager@nangaskitchen.lk', full: 'Restaurant Manager', role: 'RESTAURANT_MANAGER', branches: [3] },
    { id: 5, uname: 'cashier', email: 'cashier@nangaskitchen.lk', full: 'Kasavi Manager', role: 'CASHIER', branches: [3] },
    { id: 6, uname: 'receptionist', email: 'receptionist@erniesretreat.lk', full: 'Nadeesha Perera', role: 'RECEPTIONIST', branches: [2] },
    { id: 7, uname: 'kitchen', email: 'kitchen@nangaskitchen.lk', full: 'Chef Ruwan', role: 'KITCHEN_STAFF', branches: [3] },
    { id: 8, uname: 'storekeeper', email: 'store@waikkalhospitality.lk', full: 'Store Keeper', role: 'STORE_KEEPER', branches: [1, 2, 3] },
    { id: 9, uname: 'hr.manager', email: 'hr@waikkalhospitality.lk', full: 'HR Manager', role: 'HR_MANAGER', branches: [1, 2, 3] },
    { id: 10, uname: 'accountant', email: 'accounts@waikkalhospitality.lk', full: 'Accountant', role: 'ACCOUNTANT', branches: [1, 2, 3] },
  ];
  const demoHash = bcrypt.hashSync('DemoUser!1', 12);
  for (const d of demos) {
    usersSql.push(`INSERT INTO users (id, branch_id, username, email, password_hash, full_name, status) VALUES (${d.id}, ${d.branches[0]}, ${q(d.uname)}, ${q(d.email)}, '${demoHash}', ${q(d.full)}, 'active');`);
  }
  // user_roles
  for (const d of demos) usersSql.push(`INSERT INTO user_roles (user_id, role_id) VALUES (${d.id}, ${roleIds.get(d.role)});`);
  usersSql.push('INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);');
  // user_branch_access
  usersSql.push('INSERT INTO user_branch_access (user_id, branch_id, is_primary) VALUES (1,1,1),(1,2,0),(1,3,0);');
  for (const d of demos) {
    d.branches.forEach((b, i) => usersSql.push(`INSERT INTO user_branch_access (user_id, branch_id, is_primary) VALUES (${d.id},${b},${i === 0 ? 1 : 0});`));
  }
  lines.push(...usersSql);

  // settings
  lines.push("INSERT INTO settings (branch_id, `key`, value_json) VALUES (1,'tax.rates','{\"vat\":0,\"nbt\":0,\"service\":10}'),(2,'tax.rates','{\"vat\":0,\"nbt\":0,\"service\":10}'),(3,'tax.rates','{\"vat\":0,\"nbt\":0,\"service\":10}');");

  // expense categories
  lines.push("INSERT INTO expense_categories (name) VALUES ('Utilities'),('Salaries & Wages'),('Food & Beverage Supplies'),('Maintenance & Repairs'),('Marketing'),('Other');");

  // accommodation demo
  lines.push("INSERT INTO room_types (id, branch_id, name, description, base_rate, max_guests, amenities_json) VALUES (1,2,'Sea View Room','Queen bed, sea view balcony',18000,2,'[\"AC\",\"WiFi\",\"MiniBar\"]'),(2,2,'Garden Room','Double bed, garden view',12500,2,'[\"AC\",\"WiFi\"]'),(3,2,'Family Suite','Two bedrooms, ocean view',42000,5,'[\"AC\",\"WiFi\",\"Kitchenette\"]');");
  const rooms: string[] = [];
  for (let i = 1; i <= 8; i++) rooms.push(`(${i},2,1,'SV-${i}','1')`);
  for (let i = 1; i <= 6; i++) rooms.push(`(${i + 8},2,2,'GR-${i}','Ground')`);
  rooms.push('(15,2,3,\'FS-1\',\'1\')', '(16,2,3,\'FS-2\',\'1\')');
  lines.push(`INSERT INTO rooms (id, branch_id, room_type_id, room_number, floor) VALUES ${rooms.join(',')};`);

  // POS products + tables
  lines.push("INSERT INTO categories (id, branch_id, name, sort_order) VALUES (1,3,'Starters',1),(2,3,'Main Course',2),(3,3,'Rice & Curry',3),(4,3,'Beverages',4);");
  lines.push("INSERT INTO products (id, branch_id, category_id, name, sku, price, cost, kitchen_station) VALUES (1,3,1,'Deviled Prawns','NAN-DEV-PRAWN',2400,1300,'WOK'),(2,3,1,'Fish Cutlets (2pcs)','NAN-FISH-CUT',950,420,'FRY'),(3,3,2,'Jumbo Prawn Curry','NAN-PRAWN-CURRY',2800,1550,'CURRY'),(4,3,2,'Grilled Chicken','NAN-GRILL-CHIX',1900,980,'GRILL'),(5,3,3,'Seafood Fried Rice','NAN-SEAFOOD-RICE',1600,720,'RICE'),(6,3,3,'Rice & Curry (veg)','NAN-RICE-VEG',850,340,'RICE'),(7,3,4,'King Coconut','NAN-COCONUT',350,120,'BAR'),(8,3,4,'Fresh Lime Soda','NAN-LIME-SODA',450,110,'BAR');");
  lines.push("INSERT INTO tables (branch_id, name, capacity, location) VALUES (3,'T1',2,'Garden'),(3,'T2',2,'Garden'),(3,'T3',4,'Garden'),(3,'T4',4,'Garden'),(3,'T5',4,'Garden'),(3,'T6',4,'Garden');");

  // inventory
  lines.push("INSERT INTO inventory (branch_id, name, sku, category, unit, quantity_on_hand, reorder_level, cost) VALUES (1,'Coconut Oil (5L)','STK-OIL-5L','RAW_MATERIAL','tin',24,6,6200),(1,'Basmati Rice (50kg)','STK-RICE-50','RAW_MATERIAL','bag',18,4,16500),(1,'Chicken (whole, kg)','STK-CHIX-KG','RAW_MATERIAL','kg',40,10,1400),(1,'Prawns (kg)','STK-PRAWN-KG','RAW_MATERIAL','kg',3,8,3200),(1,'Bathroom Tissue (box)','STK-TISSUE-BOX','CONSUMABLE','box',30,10,900),(1,'LED Bulb','STK-LED-10W','CONSUMABLE','pcs',12,5,850);");

  lines.push('SET FOREIGN_KEY_CHECKS=1;');

  const out = path.join(__dirname, '../build/', 'seed.sql');
  const { mkdir } = await import('node:fs/promises');
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, lines.join('\n'), 'utf8');
  console.log(`[gen-seed] wrote ${out} (${lines.length} statements)`);
}

if (process.argv[1] && process.argv[1].endsWith('gen-seed-sql.ts')) main().catch((e) => { console.error(e); process.exit(1); });