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

  const surfaceCardClass = "surface";
  const activeUsers = users.filter((user) => user.isActive).length;
  const adminCount = users.filter((user) => user.role === "admin").length;
  const roleCount = new Set(users.map((user) => user.role)).size;
  const headerStats = [
    {
      label: t('users.systemUsers'),
      value: users.length.toString(),
      tone: 'blue',
      helper: t('users.subtitle'),
    },
    {
      label: t('users.roleAdmin'),
      value: adminCount.toString(),
      tone: 'violet',
      helper: t('users.role'),
    },
    {
      label: t('products.active'),
      value: activeUsers.toString(),
      tone: 'emerald',
      helper: t('products.status'),
    },
    {
      label: t('users.role'),
      value: roleCount.toString(),
      tone: 'amber',
      helper: t('users.userManagement'),
    },
  ];

  const headerActions = [
    <Button
      key="users-back"
      variant="outline"
      className="h-11 rounded-xl border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
      onClick={() => navigate("/admin/dashboard")}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {t('common.back')}
    </Button>,
    <Button
      key="users-add"
      className="h-11 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--background))] hover:brightness-110"
      onClick={() => handleOpenDialog()}
    >
      <Plus className="mr-2 h-4 w-4" />
      {t('users.addUser')}
    </Button>,
  ];

  return (
    <div className="space-y-6">
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
          <CardHeader className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('users.systemUsers')} ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('users.username')}</TableHead>
                  <TableHead>{t('users.role')}</TableHead>
                  <TableHead>{t('products.status')}</TableHead>
                  <TableHead>{t('users.lastLogin')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.role === "admin" && (
                          <Shield className="h-4 w-4 text-yellow-500" />
                        )}
                        {user.username}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "outline"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge variant="default" className="bg-green-500">
                          {t('products.active')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">{t('products.inactive')}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.lastLogin).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingUser(user);
                            setShowDeleteDialog(true);
                          }}
                          disabled={user.role === "admin"}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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
        <DialogContent>
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
              <label className="text-sm font-medium">{t('users.username')} *</label>
              <Input
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder={t('users.usernamePlaceholder')}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
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
              <label className="text-sm font-medium">{t('users.role')} *</label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
                className="h-4 w-4"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                {t('users.activeUser')}
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveUser}>
              {editingUser ? t('users.updateUser') : t('users.createUser')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('users.deleteUser')}</DialogTitle>
            <DialogDescription>
              {t('users.deleteConfirmation', { name: deletingUser?.username })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
