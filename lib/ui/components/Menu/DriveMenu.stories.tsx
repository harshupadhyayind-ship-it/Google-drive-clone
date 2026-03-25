import type { Meta, StoryObj } from "@storybook/react";
import { DriveMenu, MenuItem } from "./DriveMenu";
import { Download, Pencil, Trash } from "lucide-react";

const meta: Meta<typeof DriveMenu> = {
  title: "Drive/DriveMenu",
  component: DriveMenu,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof DriveMenu>;

const defaultItems: MenuItem[] = [
  {
    label: "Download",
    icon: <Download className="h-4 w-4" />,
    onClick: () => alert("Download clicked"),
  },
  {
    label: "Rename",
    icon: <Pencil className="h-4 w-4" />,
    onClick: () => alert("Rename clicked"),
  },
  { separator: true },
  {
    label: "Delete",
    icon: <Trash className="h-4 w-4" />,
    onClick: () => alert("Delete clicked"),
    variant: "destructive",
  },
];

export const Default: Story = {
  args: {
    items: defaultItems,
  },
};

export const WithDisabledItem: Story = {
  args: {
    items: [
      ...defaultItems,
      {
        label: "Coming Soon",
        onClick: () => {},
        disabled: true,
      },
    ],
  },
};

export const OnlyActions: Story = {
  args: {
    items: [
      {
        label: "Open",
        onClick: () => alert("Open"),
      },
      {
        label: "Share",
        onClick: () => alert("Share"),
      },
    ],
  },
};

export const CustomTrigger: Story = {
  args: {
    items: defaultItems,
    trigger: <button style={{ padding: "8px 12px" }}>Open Menu</button>,
  },
};