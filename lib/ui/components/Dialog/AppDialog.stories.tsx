import type { Meta, StoryObj } from "@storybook/react";
import { AppDialog } from "./AppDialog";
import { Button } from "../Button";

const meta: Meta<typeof AppDialog> = {
  title: "Components/Dialog",
  component: AppDialog,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof AppDialog>;

export const Default: Story = {
  args: {
    triggerText: "Open Dialog",
    title: "Are you absolutely sure?",
    description:
      "This action cannot be undone. This will permanently delete your account.",
    children: <p className="text-sm">Some content inside dialog</p>,
    footer: (
      <>
        <Button variant="outline">Cancel</Button>
        <Button>Confirm</Button>
      </>
    ),
  },
};