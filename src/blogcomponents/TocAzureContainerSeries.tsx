import * as React from "react";
export const TocAzureContainerSeries = () => {
  const currentDate = new Date();
  return (
    <div>
      <h2>Azure Blog Posts: Docker Images & Kubernetes</h2>
      <ol>
        {currentDate >= new Date(2022, 7 - 1, 14) ? (
          <li>
            <a href="azure-docker-container-repository">
              How to host Docker images on Microsoft Azure
            </a>
          </li>
        ) : null}
        {currentDate >= new Date(2022, 7 - 1, 28) ? (
          <li>
            <a href="azure-docker-container-repository-github">
              How to use Kubernetes with Microsoft Azure and GitHub and how to
              debug if it does not workout
            </a>
          </li>
        ) : null}
        {currentDate >= new Date(2022, 8 - 1, 5) ? (
          <li>
            <a href="azure-intro-kubernetes">
              An Introduction to Microsoft Azure and Kubernetes using Helm and
              Docker Images
            </a>
          </li>
        ) : null}
        {currentDate >= new Date(2022, 8 - 1, 23) ? (
          <li>
            <a href="azure-kubernetes-public-access">
              How to Access your Web Application on Kubernetes Azure
            </a>
          </li>
        ) : null}
        {currentDate >= new Date(2022, 8 - 1, 26) ? (
          <li>
            <a href="azure-kubernetes-pod-debug-crash">
              How to Debug a Kubernetes Pod that Crash at Startup (works on
              Microsoft Azure Kubernetes)?
            </a>
          </li>
        ) : null}
      </ol>
    </div>
  );
};
