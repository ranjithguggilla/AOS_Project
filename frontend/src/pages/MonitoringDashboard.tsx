import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Typography, CircularProgress } from '@mui/material';

const tabLabels = [
  'Memory',
  'Requests',
  'Cache',
  'Replicas',
  'Active Users',
];

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`monitoring-tabpanel-${index}`}
      aria-labelledby={`monitoring-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}


const prometheusUrl = 'http://localhost:9090/api/v1/query';

const MonitoringDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [requestData, setRequestData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch request rate from Prometheus when Requests tab is active
  useEffect(() => {
    if (tab === 1) {
      setLoading(true);
      fetch(`${prometheusUrl}?query=sum(rate(http_request_duration_seconds_count[5m])) by (service)`)
        .then((res) => res.json())
        .then((data) => {
          setRequestData(data.data.result);
          setLoading(false);
        })
        .catch((err) => {
          setError('Failed to fetch Prometheus data');
          setLoading(false);
        });
    }
  }, [tab]);

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="monitoring tabs">
        {tabLabels.map((label, idx) => (
          <Tab label={label} key={label} id={`monitoring-tab-${idx}`} aria-controls={`monitoring-tabpanel-${idx}`} />
        ))}
      </Tabs>
      <TabPanel value={tab} index={0}>
        <Typography>Memory metrics will be displayed here.</Typography>
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <Typography variant="h6">Request Rate by Service</Typography>
        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}
        {requestData && (
          <Box>
            {requestData.map((item: any) => (
              <Typography key={item.metric.service}>
                {item.metric.service}: {parseFloat(item.value[1]).toFixed(2)} req/s
              </Typography>
            ))}
          </Box>
        )}
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <Typography>Cache metrics will be displayed here.</Typography>
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <Typography>Replica metrics will be displayed here.</Typography>
      </TabPanel>
      <TabPanel value={tab} index={4}>
        <Typography>Active user metrics will be displayed here.</Typography>
      </TabPanel>
    </Box>
  );
};

export default MonitoringDashboard;
