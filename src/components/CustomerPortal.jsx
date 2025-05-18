import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getClientProfile } from "../redux/Slice/AuthSlice";

// Material-UI Components
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  CardMedia,
  CardActions,
  InputAdornment
} from "@mui/material";
import {
  Upload as UploadIcon,
  Description as DescriptionIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Link as LinkIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from "@mui/icons-material";
import { uploadImage } from "../redux/Slice/ImageSlice";

// Environment Variables
const API_URL = import.meta.env.VITE_API_URL;
const TOKEN = import.meta.env.VITE_TOKEN;

const CustomerPortal = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("proposals");
  const [leadData, setLeadData] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [proposalData, setProposalData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [previewImage, setPreviewImage] = useState(null);
  const { user, cusprofile } = useSelector(state => state.auth);
  
  // Form state for proposal upload
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Requirements: "",
    PhoneNumber: "",
    Reference: ""
  });
  const [formFile, setFormFile] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const { imageUrl } = useSelector((state) => state.image);

  const clientId = user?.Client_Id;

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await dispatch(getClientProfile()).unwrap();
        console.log("✅ Client profile fetched");
      } catch (err) {
        console.error("❌ Failed to fetch client profile:", err);
        showSnackbar("Failed to fetch client profile", "error");
      }
    };
    fetchProfile();
  }, [dispatch]);
  
  useEffect(() => {
    const fetchAllData = async () => {
      if (!cusprofile || cusprofile.length === 0) {
        console.warn("⚠️ cusprofile is not available yet.");
        return;
      }
  
      setLoading(true);
      setError(null);
  
      try {
        const headers = { Authorization: `Bearer ${TOKEN}` };
  
        if (!API_URL || !TOKEN) {
          console.error("❌ Missing API_URL or TOKEN", { API_URL, TOKEN });
          showSnackbar("Configuration error - missing API details", "error");
          return;
        }
  
        // Fetch lead data
        const leadUrl = `${API_URL}/api/user/service/681c4cdfbad3787228013c70`;
        const leadRes = await axios.get(leadUrl, {
          headers,
          params: { Client_Id: clientId }
        });
  
        const allLeads = leadRes.data || [];
        setLeadData(allLeads);
  
        // Filter leads matching the current clientId
        const filteredLeads = allLeads.filter(lead => lead.Client_Id === clientId);
        const leadIds = filteredLeads.map(lead => lead.Lead_Id);
  
        const projectUrl = `${API_URL}/api/user/service/681c4476bad37872280139f7`;
        const projectRes = await axios.get(projectUrl, {
          headers,
          params: { Client_Id: clientId, Lead_Id: leadIds.join(",") }
        });

        const allProjects = projectRes.data || [];
        setProjectData(allProjects);

        const filteredProjects = allProjects.filter(project => project.Client_Id === clientId);
        const projectIds = filteredProjects.map(project => project.Project_Id);
  
        const proposalUrl = `${API_URL}/api/user/service/681c454cbad3787228013a5b`;
        const proposalRes = await axios.get(proposalUrl, {
          headers,
          params: { Client_Id: clientId, project_Id: projectIds.join(",") }
        });
  
        const proposalRaw = proposalRes.data.data; 
        const parsedItems = Array.isArray(proposalRaw?.Response)
          ? proposalRaw.Response.map((item) => {
              const specs = typeof item.Specs === "string" ? JSON.parse(item.Specs) : item.Specs;
              return {
                name: item.Name,
                description: item.Category,
                code: item.Id,
                image: item["Product Image"],
                specs,
              };
            })
          : [];
  
        setProposalData({
          title: proposalRaw?.Id || "",
          subtitle: proposalRaw?.Name || "",
          image: proposalRaw?.File || "",
          items: parsedItems,
        });
      } catch (err) {
        if (axios.isAxiosError(err)) {
          console.error("❌ Axios error:", err.response?.data || err.message);
          showSnackbar(err.response?.data?.message || "Failed to fetch data", "error");
        } else {
          console.error("❌ Unexpected error:", err);
          showSnackbar("An unexpected error occurred", "error");
        }
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
  
    if (activeTab === "proposals") {
      fetchAllData();
    }
  }, [activeTab, cusprofile, clientId]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      showSnackbar("Only JPEG, PNG, or PDF files are allowed", "error");
      return;
    }
    
    if (file.size > maxSize) {
      showSnackbar("File size must be less than 5MB", "error");
      return;
    }
  
    try {
      setFormSubmitting(true);
      
      // Create FormData and append the file
      const formData = new FormData();
      formData.append("image", file);
      
      // Dispatch the uploadImage action
      const imageUrl = await dispatch(uploadImage(formData)).unwrap();
      
      // Set the preview if it's an image
      if (file.type.startsWith('image/')) {
        setPreviewImage(URL.createObjectURL(file));
      }
      
      // Store the file and URL in state
      setFormFile({
        file,
        url: imageUrl  // This is the URL returned from the server
      });
      
      showSnackbar("File uploaded successfully!", "success");
    } catch (err) {
      console.error("File upload error:", err);
      showSnackbar("Failed to upload file", "error");
    } finally {
      setFormSubmitting(false);
    }
  };
  
  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    
    if (!clientId) {
      setError("Client ID is required but not available");
      showSnackbar("Client ID is missing", "error");
      return;
    }
    
    setFormSubmitting(true);
    setError(null);
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      formDataToSend.append("Client_Id", clientId);
      
      // Append file URL if exists (from the uploadImage response)
      if (formFile?.url) {
        formDataToSend.append("File", formFile.url);
      }
      
      const response = await axios.post(
        `${API_URL}/api/user/service/681c4cdfbad3787228013c70`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "multipart/form-data",
          }
        }
      );
      
      console.log("✅ Proposal submitted successfully:", response.data);
      showSnackbar("Proposal submitted successfully!", "success");
      
      // Reset form
      setFormData({
        Name: "",
        Email: "",
        Requirements: "",
        PhoneNumber: "",
        Reference: ""
      });
      setFormFile(null);
      setPreviewImage(null);
      
    } catch (err) {
      console.error("Submission error:", err);
      let errorMsg = "Failed to submit proposal";
      
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.message || 
                 err.response?.data?.error?.message || 
                 errorMsg;
        
        console.error("❌ Axios error details:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
      }
      
      setError(errorMsg);
      showSnackbar(errorMsg, "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  const ProposalCard = ({ title, subtitle, image, items }) => (
    <Card sx={{ mb: 4 }}>
      <CardHeader
        title={title}
        subheader={subtitle}
        titleTypographyProps={{ variant: "h5" }}
        subheaderTypographyProps={{ variant: "subtitle1" }}
      />
      <Divider />
      <CardContent>
        <Box component="form" onSubmit={handleSubmitProposal} sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="Name"
                value={formData.Name}
                onChange={handleInputChange}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="Email"
                type="email"
                value={formData.Email}
                onChange={handleInputChange}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Requirements"
                name="Requirements"
                value={formData.Requirements}
                onChange={handleInputChange}
                multiline
                rows={4}
                InputProps={{ startAdornment: <InputAdornment position="start"><DescriptionIcon /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="PhoneNumber"
                value={formData.PhoneNumber}
                onChange={handleInputChange}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Reference"
                name="Reference"
                value={formData.Reference}
                onChange={handleInputChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <input
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                id="upload-file"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="upload-file">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  fullWidth
                >
                  {formFile ? formFile.name : "Upload Supporting File (JPEG, PNG, PDF)"}
                </Button>
              </label>
              {previewImage && (
                <Box sx={{ mt: 2 }}>
                  <CardMedia
                    component="img"
                    image={previewImage}
                    alt="Uploaded Preview"
                    sx={{ maxWidth: 300, maxHeight: 300 }}
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={formSubmitting}
                  startIcon={formSubmitting ? <CircularProgress size={20} /> : null}
                >
                  {formSubmitting ? "Submitting..." : "Submit Proposal"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        <Grid container spacing={3}>
          {items?.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={item.image}
                  alt={item.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Category:</strong> {item.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Code:</strong> {item.code}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <List dense>
                    {item.specs?.map((spec, i) => (
                      <ListItem key={i}>
                        <ListItemText
                          primary={`Thickness: ${spec.Thickness}`}
                          secondary={`Wear Layer: ${spec["Wear Layer"]}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <CardActions>
                  <Button size="small">View Details</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const QuotesTab = () => (
    <Card>
      <CardHeader title="Project Quote Summary" titleTypographyProps={{ variant: "h5" }} />
      <Divider />
      <CardContent>
        <Typography variant="body1" paragraph>Detailed BOQ and breakdown per area.</Typography>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" startIcon={<DescriptionIcon />}>
            Download PDF Quote
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            aria-label="Customer portal tabs"
            variant="fullWidth"
          >
            <Tab label="Proposals" value="proposals" />
            <Tab label="Quotes" value="quotes" />
          </Tabs>
        </Box>
        
        <Box sx={{ pt: 3 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          )}
          
          {activeTab === "proposals" && proposalData && (
            <ProposalCard
              title={proposalData.title}
              subtitle={proposalData.subtitle}
              image={proposalData.image}
              items={proposalData.items}
            />
          )}
          
          {activeTab === "quotes" && <QuotesTab />}
        </Box>
      </Paper>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />,
            error: <ErrorIcon fontSize="inherit" />
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CustomerPortal;