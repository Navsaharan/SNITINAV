-- CreateTable
CREATE TABLE "NavigationItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "href" TEXT,
    "parentId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "linkType" TEXT NOT NULL DEFAULT 'internal',
    "target" TEXT DEFAULT '_self',
    "description" TEXT,
    "icon" TEXT,
    "cssClass" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavigationItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NavigationItem_parentId_idx" ON "NavigationItem"("parentId");
CREATE INDEX "NavigationItem_order_idx" ON "NavigationItem"("order");
CREATE INDEX "NavigationItem_isVisible_idx" ON "NavigationItem"("isVisible");

-- AddForeignKey
ALTER TABLE "NavigationItem" ADD CONSTRAINT "NavigationItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "NavigationItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert default navigation structure
INSERT INTO "NavigationItem" ("id", "title", "href", "parentId", "order", "isVisible", "linkType") VALUES
('nav-home', 'Home', '/', NULL, 0, true, 'internal'),
('nav-about', 'About Us', NULL, NULL, 1, true, 'dropdown'),
('nav-about-institute', 'About Institute', '/about-institute', 'nav-about', 0, true, 'internal'),
('nav-about-intro', 'Introduction of Institute', '/introduction-institute', 'nav-about', 1, true, 'internal'),
('nav-about-scheme', 'Scheme Running in The Institute', '/scheme-running', 'nav-about', 2, true, 'internal'),
('nav-admissions', 'Admissions', NULL, NULL, 2, true, 'dropdown'),
('nav-admissions-criteria', 'Admission Criteria', '/admission-criteria', 'nav-admissions', 0, true, 'internal'),
('nav-admissions-ncvt-scvt', 'Trades Affilated To NCVT and SCVT', '/ncvt-scvt-affilated', 'nav-admissions', 1, true, 'internal'),
('nav-admissions-ncvt', 'Summary of Trades Affilated To NCVT', '/ncvt-affilated', 'nav-admissions', 2, true, 'internal'),
('nav-admissions-scvt', 'Summary of Trades Affilated To SCVT', '/scvt-affilated', 'nav-admissions', 3, true, 'internal'),
('nav-admissions-format', 'Application Format', '/application-format', 'nav-admissions', 4, true, 'internal'),
('nav-admissions-fee', 'Fee Structure', '/fee-structure', 'nav-admissions', 5, true, 'internal'),
('nav-facilities', 'Facilities', NULL, NULL, 3, true, 'dropdown'),
('nav-facilities-infra', 'Infrastructure,Buliding and Workshop', '/infrastructure', 'nav-facilities', 0, true, 'internal'),
('nav-facilities-ts', 'Trade Specific Infrastructure', '/ts-infrastructure', 'nav-facilities', 1, true, 'internal'),
('nav-facilities-power', 'Electric Power Supply', '/electric-power', 'nav-facilities', 2, true, 'internal'),
('nav-facilities-library', 'Library', '/library', 'nav-facilities', 3, true, 'internal'),
('nav-facilities-lab', 'Computer lab', '/computer-lab', 'nav-facilities', 4, true, 'internal'),
('nav-facilities-sports', 'Sports', '/sports', 'nav-facilities', 5, true, 'internal'),
('nav-trainee', 'Trainee', NULL, NULL, 4, true, 'dropdown'),
('nav-trainee-achievements', 'Achievements By Trainees', '/achievements-by-trainees', 'nav-trainee', 0, true, 'internal'),
('nav-trainee-records', 'Records of Trainees', '/records-of-trainees', 'nav-trainee', 1, true, 'internal'),
('nav-trainee-attendance', 'Attendance of Trainees', '/attendance-of-trainee', 'nav-trainee', 2, true, 'internal'),
('nav-trainee-certificates', 'Certificates Issued To Trainees', '/certificate-issued', 'nav-trainee', 3, true, 'internal'),
('nav-trainee-progress', 'PROGRESS CARD', '/progress-card', 'nav-trainee', 4, true, 'internal'),
('nav-trainee-placements', 'Placements', '/placements', 'nav-trainee', 5, true, 'internal'),
('nav-trainee-results', 'Results', '/results', 'nav-trainee', 6, true, 'internal'),
('nav-trainee-energy', 'Energy Consumption', '/ee-consumption-pspm', 'nav-trainee', 7, true, 'internal'),
('nav-trainee-material', 'Raw Material Consumption', '/rm-consumption-pspm', 'nav-trainee', 8, true, 'internal'),
('nav-staff', 'Staff', NULL, NULL, 5, true, 'dropdown'),
('nav-staff-faculty', 'Faculty', '/faculty', 'nav-staff', 0, true, 'internal'),
('nav-staff-admin', 'Administrative Staff', '/administrative-staff', 'nav-staff', 1, true, 'internal'),
('nav-staff-attendance', 'Attendance of Instructor', '/attendance-instructor', 'nav-staff', 2, true, 'internal'),
('nav-more', 'More', NULL, NULL, 6, true, 'dropdown'),
('nav-more-industry', 'Industry Institute linkage', '/industry-linkages', 'nav-more', 0, true, 'dropdown'),
('nav-more-industry-partner', 'Name of the Industry Partner', '/industry-partner', 'nav-more-industry', 0, true, 'internal'),
('nav-more-industry-activities', 'Major Activities / Contributions', '/major-activities', 'nav-more-industry', 1, true, 'internal'),
('nav-more-industry-visit', 'Industry Visit / Industrial Tour', '/industry-visit', 'nav-more-industry', 2, true, 'internal'),
('nav-more-industry-faculty', 'Guest Faculty', '/guest-faculty', 'nav-more-industry', 3, true, 'internal'),
('nav-more-industry-workshop', 'Workshop & Seminars', '/workshop-seminar', 'nav-more-industry', 4, true, 'internal'),
('nav-more-activities', 'Activities', '/activities', 'nav-more', 1, true, 'internal'),
('nav-more-rti', 'RTI', '/rti', 'nav-more', 2, true, 'internal'),
('nav-more-inspection', 'Inspection Details', '/inspection-details', 'nav-more', 3, true, 'internal'),
('nav-more-directorate', 'State Directorate', '/state-directorate', 'nav-more', 4, true, 'internal'),
('nav-more-iso', 'Certificate ISO', '/iso-certificate', 'nav-more', 5, true, 'internal'),
('nav-more-funds', 'Funds Status', '/fund-status', 'nav-more', 6, true, 'internal'),
('nav-more-orders', 'DGET And State Govt. Orders', '/dget-orders', 'nav-more', 7, true, 'internal'),
('nav-more-rating', 'Rating Of Institute', '/ratting', 'nav-more', 8, true, 'internal'),
('nav-more-grievance', 'Grievance Redressal Mechanism', '/grm', 'nav-more', 9, true, 'internal'),
('nav-more-maintenance', 'Maintenance Expenditure', '/building-maintenance', 'nav-more', 10, true, 'internal'),
('nav-gallery', 'Gallery', '/gallery', NULL, 7, true, 'internal'),
('nav-feedback', 'Feedback', '/feedback', NULL, 8, true, 'internal'),
('nav-contact', 'Contact', '/contact', NULL, 9, true, 'internal'),
('nav-sitemap', 'Site Map', '/sitemap', NULL, 10, true, 'internal');
