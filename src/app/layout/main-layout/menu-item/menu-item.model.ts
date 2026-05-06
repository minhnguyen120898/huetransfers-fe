export interface MenuItemProps {
  icon?: string;
  label: string;
  route?: string | null;
  expanded?: boolean;
  active?: boolean;
  children?: Array<MenuItemProps>;
  hidden?: boolean;
  adminOnly?: boolean;
}
