import { BasicLogViewer } from "./BasicLogViewer.tsx";
import { useServices } from "./hooks/useServices.tsx";

export default function App() {
  const services = useServices();
  if (services.isLoading) return <h1>Loading...</h1>;

  return (
    <div className="bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {services.data?.map((tab) => (
          <div className={"my-8"}>
            <h1 className="mb-4 text-2xl font-bold">{tab.name}</h1>
            <BasicLogViewer url={tab.streamFromStart} />
          </div>
        ))}
      </div>
    </div>
  );
}
