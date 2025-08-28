import { CorporateClientResponse } from '@/services/api/marketing';
import { Drawer } from 'antd';

interface CorporateClientDrawerProps {
  open: boolean;
  onClose: () => void;
  client?: CorporateClientResponse | null;
}

export default function CorporateClientDrawer({
  open,
  onClose,
  client,
}: CorporateClientDrawerProps) {
  return (
    <Drawer open={open} onClose={onClose}>
      <div>{JSON.stringify(client)}</div>
    </Drawer>
  );
}
