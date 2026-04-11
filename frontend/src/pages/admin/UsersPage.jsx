import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowLeft, Plus, Edit, Trash2, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

export default function UsersPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [users] = useState([
    { id: 1, username: "admin", role: "admin", isActive: true, lastLogin: new Date().toISOString() },
    { id: 2, username: "cashier", role: "cashier", isActive: true, lastLogin: new Date().toISOString() },
  ]);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "cashier",
    isActive: true,
  });

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: "",
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        password: "",
        role: "cashier",
        isActive: true,
      });
    }
    setShowDialog(true);
  };

  const handleSaveUser = () => {
    // In a real app, this would call the API
    toast.success(editingUser ? "User updated successfully" : "User created successfully");
    setShowDialog(false);
  };

  const handleDeleteUser = () => {
    // In a real app, this would call the API
    toast.success("User deleted successfully");
    setShowDeleteDialog(false);
  };

  const surfaceCardClass = "rounded-xl border border-white/5 bg-[#242426]";
  const activeUsers = users.filter((user) => user.isActive).length;
  const adminCount = users.filter((user) => user.role === "admin").length;
  const roleCount = new Set(users.map((user) => user.role)).size;
  const headerStats = [
    {
      label: t('users.systemUsers'),
      value: users.length.toString(),
      tone: 'slate',
      helper: t('users.subtitle'),
    },
    {
      label: t('users.roleAdmin'),
      value: adminCount.toString(),
      tone: 'slate',
      helper: t('users.role'),
    },
    {
      label: t('products.active'),
      value: activeUsers.toString(),
      tone: 'slate',
      helper: t('products.status'),
    },
    {
      label: t('users.role'),
      value: roleCount.toString(),
      tone: 'slate',
      helper: t('users.userManagement'),
    },
  ];

  const headerActions = [
    <Button
      key="users-back"
      variant="outline"
      className="h-11 rounded-xl border border-white/10 bg-[#2C2C2E] text-white/90 hover:bg-white/[0.08]"
      onClick={() => navigate("/admin/dashboard")}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {t('common.back')}
    </Button>,
    <Button
      key="users-add"
      className="h-11 rounded-xl bg-[#0A84FF] text-white hover:brightness-110"
      onClick={() => handleOpenDialog()}
    >
      <Plus className="mr-2 h-4 w-4" />
      {t('users.addUser')}
    </Button>,
  ];

  return (
    <div className="space-y-6 text-white/90">
      <PageHeader
        icon={Users}
        title={t('users.title')}
        subtitle={t('users.userManagement')}
        badge={t('dashboard.overview')}
        breadcrumbs={[
          { label: 'SDM GROCERY', href: '/admin/dashboard' },
          { label: t('users.title') },
        ]}
        actions={headerActions}
        stats={headerStats}
      />

      <div className="space-y-6">
        <Card className={surfaceCardClass}>
          <CardHeader className="border-b border-white/5 bg-transparent">
            <CardTitle className="flex items-center gap-2 text-white/95">
              <Users className="h-5 w-5 text-white/80" />
              {t('users.systemUsers')} ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-white/55">{t('users.username')}</TableHead>
                  <TableHead className="text-white/55">{t('users.role')}</TableHead>
                  <TableHead className="text-white/55">{t('products.status')}</TableHead>
                  <TableHead className="text-white/55">{t('users.lastLogin')}</TableHead>
                  <TableHead className="text-right text-white/55">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.02]">
                    <TableCell className="font-medium text-white/92">
                      <div className="flex items-center gap-2">
                        {user.role === "admin" && (
                          <Shield className="h-4 w-4 text-white/70" />
                        )}
                        {user.username}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="border border-white/10 bg-white/[0.08] text-white">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge className="border border-white/10 bg-white/[0.12] text-white">
                          {t('products.active')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="border border-white/10 bg-white/[0.03] text-white/70">{t('products.inactive')}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-white/60">
                      {new Date(user.lastLogin).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/10 bg-[#1C1C1E] text-white/90 hover:bg-white/[0.08]"
                          onClick={() => handleOpenDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/10 bg-[#1C1C1E] text-white/90 hover:bg-white/[0.08]"
                          onClick={() => {
                            setDeletingUser(user);
                            setShowDeleteDialog(true);
                          }}
                          disabled={user.role === "admin"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit User Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="rounded-2xl border border-white/10 bg-[#1C1C1E] text-white">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? t('users.editUser') : t('users.addNewUser')}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? t('users.updateUserDesc') : t('users.createUserDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-white/85">{t('users.username')} *</label>
              <Input
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder={t('users.usernamePlaceholder')}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-white/85">
                {t('users.password')} {editingUser ? t('users.passwordHint') : '*'}
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={t('users.passwordPlaceholder')}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-white/85">{t('users.role')} *</label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="bg-[#242426]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1E]">
                  <SelectItem value="admin">{t('users.roleAdmin')}</SelectItem>
                  <SelectItem value="manager">{t('users.roleManager')}</SelectItem>
                  <SelectItem value="cashier">{t('users.roleCashier')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4 accent-[#0A84FF]"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-white/85">
                {t('users.activeUser')}
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-white/10 bg-[#242426] text-white/90 hover:bg-white/[0.08]" onClick={() => setShowDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button className="bg-[#0A84FF] text-white hover:brightness-110" onClick={handleSaveUser}>
              {editingUser ? t('users.updateUser') : t('users.createUser')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-2xl border border-white/10 bg-[#1C1C1E] text-white">
          <DialogHeader>
            <DialogTitle>{t('users.deleteUser')}</DialogTitle>
            <DialogDescription>
              {t('users.deleteConfirmation', { name: deletingUser?.username })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-white/10 bg-[#242426] text-white/90 hover:bg-white/[0.08]"
              onClick={() => setShowDeleteDialog(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button className="bg-[#0A84FF] text-white hover:brightness-110" onClick={handleDeleteUser}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
