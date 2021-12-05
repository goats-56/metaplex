import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnectionConfig } from "../../contexts";
import { notify, shortenAddress } from "@oyster/common";
import { CopyOutlined } from "@ant-design/icons";
import { ModalEnum, useModal, useWalletModal } from "../../contexts";
import {
  Box,
  Button,
  Divider,
  Drawer,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Stack,
} from "@mui/material";

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export const Settings = ({ narrow } : { narrow : boolean }) => {
  const { disconnect, publicKey } = useWallet();
  const { env } = useConnectionConfig();
  const { setVisible } = useWalletModal();
  const open = React.useCallback(() => setVisible(true), [setVisible]);
  const { setModal } = useModal();

  const handleConnect = React.useCallback(() => {
    setModal(ModalEnum.WALLET);
    setVisible(true);
  }, [setModal, setVisible]);

  const connectedActions = [
    {
      click: async () => {
        if (publicKey) {
          await navigator.clipboard.writeText(publicKey.toBase58());
          notify({
            message: "Wallet update",
            description: "Address copied to clipboard",
          });
        }
      },
      innerNarrow: () => (
        `Copy Address (${publicKey && shortenAddress(publicKey.toBase58())})`
      ),
      inner: function ConnectedWalletCopyC() {
        return (
          <React.Fragment>
            <CopyOutlined />
            {publicKey && shortenAddress(publicKey.toBase58())}
          </React.Fragment>
        );
      },
    },
    {
      click: open,
      inner: () => "Change\u00A0Wallet",
    },
    {
      click: () => disconnect().catch(),
      inner: () => `Disconnect\u00A0(${env})`,
      expandedExtra: { // these are interepreted as props. TODO: specific types
        color: "error" as any,
        variant: "contained" as any,
      }
    },
  ];

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const hackySkipSet = "hackySkipSet";
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    if (event.target.classList.contains(hackySkipSet)) {
      return;
    }

    setDrawerOpen(open);
  };

  const drawerC = (inner) => {
    return (
      <React.Fragment>
        <Button onClick={toggleDrawer(true)}>
          <AccountBalanceWalletIcon />
        </Button>
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
        >
          <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
          >
            {inner}
          </Box>
        </Drawer>
      </React.Fragment>
    );
  };

  if (narrow) {
    const listHead = (
      <ListItem>
        <ListItemText
          primary="Wallet"
          primaryTypographyProps={{
            fontSize: "1.2rem",
            fontWeight: 'medium',
            letterSpacing: 0,
          }}
        />
      </ListItem>
    );
    return (
      <React.Fragment>
        {publicKey && drawerC(
          <List>
            {listHead}
            <Divider />
            {connectedActions.map((a, idx) => {
              return (
                <ListItemButton onClick={a.click} key={idx}>
                  {(a.innerNarrow && a.innerNarrow()) || a.inner()}
                </ListItemButton>
              );
            })}
          </List>
        )}
      </React.Fragment>
    );
  } else {
    return (
      <Stack
        direction="row"
        spacing={2}
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginRight: "36px",
        }}
      >
        {!publicKey && (
          <React.Fragment>

            <Link underline="none">
              <Button
                variant="contained"
                onClick={handleConnect}
              >
                Connect
              </Button>
            </Link>
          </React.Fragment>
        )}
        {publicKey && connectedActions.map((a, idx) => {
            return (
              <Button
                key={idx}
                variant="outlined"
                onClick={a.click}
                {...a.expandedExtra}
              >
                {a.inner()}
              </Button>
            );
          })
        }
      </Stack>
    );
  }
};
