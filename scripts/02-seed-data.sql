-- Update seed data to include teams and updated fields

-- Insert sample users (these will be created via Supabase Auth)
INSERT INTO users (id, username, name, email, role, avatar_url) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'johndoe', 'John Doe', 'john@example.com', 'Admin', '/placeholder.svg?height=40&width=40'),
('550e8400-e29b-41d4-a716-446655440002', 'janesmith', 'Jane Smith', 'jane@example.com', 'Manager', '/placeholder.svg?height=40&width=40'),
('550e8400-e29b-41d4-a716-446655440003', 'mikejohnson', 'Mike Johnson', 'mike@example.com', 'Designer', '/placeholder.svg?height=40&width=40'),
('550e8400-e29b-41d4-a716-446655440004', 'sarahwilson', 'Sarah Wilson', 'sarah@example.com', 'Designer', '/placeholder.svg?height=40&width=40'),
('550e8400-e29b-41d4-a716-446655440005', 'tombrown', 'Tom Brown', 'tom@example.com', 'Manager', '/placeholder.svg?height=40&width=40');

-- Insert sample teams
INSERT INTO teams (id, name, description, leader_id) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Frontend Team', 'Responsible for UI/UX and frontend development', '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440002', 'Backend Team', 'Handles server-side development and APIs', '550e8400-e29b-41d4-a716-446655440005'),
('660e8400-e29b-41d4-a716-446655440003', 'Design Team', 'Creates visual designs and user experiences', '550e8400-e29b-41d4-a716-446655440003');

-- Insert team members
INSERT INTO team_members (team_id, user_id) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004');

-- Update projects with team assignments
INSERT INTO projects (id, name, description, client_id, status, start_date, end_date, team_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Website Redesign', 'Complete redesign of corporate website', '550e8400-e29b-41d4-a716-446655440001', 'Active', '2024-01-15', '2024-03-15', '660e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440002', 'Mobile App Development', 'Native mobile app for iOS and Android', '550e8400-e29b-41d4-a716-446655440001', 'Active', '2024-02-01', '2024-06-01', '660e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440003', 'Brand Identity', 'Logo and brand guidelines development', '550e8400-e29b-41d4-a716-446655440002', 'Completed', '2024-01-01', '2024-02-28', '660e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440004', 'E-commerce Platform', 'Custom e-commerce solution', '550e8400-e29b-41d4-a716-446655440001', 'Active', '2024-03-01', '2024-08-01', '660e8400-e29b-41d4-a716-446655440002');

-- Update tasks with created_by and estimated_hours
INSERT INTO tasks (id, title, description, status, priority, due_date, estimated_hours, assigned_to, created_by, project_id) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Design Homepage Layout', 'Create wireframes and mockups for the new homepage', 'In Progress', 'High', '2024-02-15', 16, '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440002', 'Implement User Authentication', 'Set up login and registration functionality', 'Completed', 'High', '2024-02-10', 24, '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002'),
('880e8400-e29b-41d4-a716-446655440003', 'Create Logo Concepts', 'Design 3 different logo concepts for client review', 'Completed', 'Medium', '2024-01-20', 8, '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003'),
('880e8400-e29b-41d4-a716-446655440004', 'Database Schema Design', 'Design and implement the database structure', 'In Progress', 'High', '2024-02-20', 32, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440004'),
('880e8400-e29b-41d4-a716-446655440005', 'Mobile UI Testing', 'Test the mobile interface on different devices', 'Pending', 'Medium', '2024-02-25', 12, '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002'),
('880e8400-e29b-41d4-a716-446655440006', 'Content Migration', 'Migrate existing content to new website', 'Pending', 'Low', '2024-03-01', 20, '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001');

-- Update comments with proper IDs
INSERT INTO comments (task_id, user_id, content) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Great progress on the wireframes! Please consider mobile responsiveness.'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Authentication is working perfectly. Ready for testing.'),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'Client loved concept #2. Moving forward with that design.');
