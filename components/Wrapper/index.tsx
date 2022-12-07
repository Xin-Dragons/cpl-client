import { Tabs, Tab } from "@mui/material";
import classnames from "classnames";
import { filter } from "lodash";
import { FC } from "react";

import styles from '../../styles/Home.module.scss';
import { Layout } from "../Layout";

export const Wrapper: FC = ({ collection }) => {
  return <Layout page="collections">
    <div className={classnames(styles.grid)}>
      <h2 className={classnames(styles.pagetitle)}>
        {collection.name}
      </h2>
    </div>
    <div className={classnames(styles.grid)}>
      <Tabs
        value={filter}
        onChange={onFilterChange}
      >
        <Tab value="dashboard" label="Dashboard" />
        <Tab value="sold" label="Debts" />
        <Tab value="collection" label="Collection" />
        <Tab value="restore" label="CPL Marked" />
      </Tabs>
    </div>
  </Layout>;
}