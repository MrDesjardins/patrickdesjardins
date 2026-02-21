export const TocAzureContainerSeries = (): React.ReactElement => {
  return (
    <div>
      <h2>Azure Blog Posts: Docker Images & Kubernetes</h2>
      <ol>
        <li>
          <a href="/blog/azure-docker-container-repository">
            How to host Docker images on Microsoft Azure
          </a>
        </li>
        <li>
          <a href="/blog/azure-docker-container-repository-github">
            How to use Kubernetes with Microsoft Azure and GitHub and how to
            debug if it does not workout
          </a>
        </li>
        <li>
          <a href="/blog/azure-intro-kubernetes">
            An Introduction to Microsoft Azure and Kubernetes using Helm and
            Docker Images
          </a>
        </li>
        <li>
          <a href="/blog/azure-kubernetes-public-access">
            How to Access your Web Application on Kubernetes Azure
          </a>
        </li>
        <li>
          <a href="/blog/azure-kubernetes-pod-debug-crash">
            How to Debug a Kubernetes Pod that Crash at Startup (works on
            Microsoft Azure Kubernetes)?
          </a>
        </li>
        <li>
          <a href="/blog/helmchart-introduction">
            How to use Helm Chart to configure dynamically your Kubernetes
            file for beginner?
          </a>
        </li>
      </ol>
    </div>
  );
};
