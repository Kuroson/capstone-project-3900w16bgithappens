type SideNavBarProps = {
  empty?: boolean;
};

export default function SideNavbar({ empty }: SideNavBarProps): JSX.Element {
  if (empty === true) {
    return <div></div>;
  }

  return (
    <div className="bg-green-500">
      <div className="h-full fixed top-[0] left-[0] z-10">content</div>
    </div>
  );
}
