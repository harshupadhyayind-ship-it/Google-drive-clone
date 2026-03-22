type Props = {
  name: string;
};

export const FileCard = ({ name }: Props) => {
  return (
    <div className="p-4 border rounded-lg hover:shadow cursor-pointer">
      📄 {name}
    </div>
  );
};