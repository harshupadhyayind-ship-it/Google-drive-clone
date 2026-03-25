import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb } from "./Breadcrumb";

const meta: Meta<typeof Breadcrumb> = {
  title: "UI/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  args: {
    items: [
      { label: "My Drive", href: "/dashboard" },
      { label: "Marketing", href: "/dashboard?folderId=1" },
      { label: "Q1 Reports", isCurrent: true },
    ],
  },
};

