// lib/ui/components/Link/Link.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "./index";

const meta: Meta<typeof Link> = {
  title: "Components/Link",
  component: Link,
  args: {
    children: "Click me",
    href: "/",
    variant: "primary",
    size: "md",
  },
};

export default meta;

type Story = StoryObj<typeof Link>;

export const Default: Story = {};

export const Primary: Story = {
  args: {
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
  },
};

export const Underline: Story = {
  args: {
    variant: "underline",
  },
};

export const External: Story = {
  args: {
    href: "https://google.com",
    external: true,
    children: "External Link",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4">
      <Link size="sm" href="#">Small</Link>
      <Link size="md" href="#">Medium</Link>
      <Link size="lg" href="#">Large</Link>
    </div>
  ),
};